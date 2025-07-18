const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/smart-supply-sourcing', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productName: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    mpesaReceiptNumber: String,
    checkoutRequestID: String,
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// JWT Secret
const JWT_SECRET = 'your-secret-key-change-this';

// M-Pesa Configuration
const MPESA_CONFIG = {
    consumerKey: 'YOUR_CONSUMER_KEY',
    consumerSecret: 'YOUR_CONSUMER_SECRET',
    businessShortCode: '3788280',
    passkey: 'YOUR_PASSKEY',
    callbackURL: 'https://yourdomain.com/api/mpesa/callback',
    environment: 'sandbox'
};

const MPESA_BASE_URL = MPESA_CONFIG.environment === 'sandbox' 
    ? 'https://sandbox.safaricom.co.ke' 
    : 'https://api.safaricom.co.ke';

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role, adminPassword } = req.body;
        
        // Check admin password for admin registration
        if (role === 'admin' && adminPassword !== 'admin123') {
            return res.status(400).json({ message: 'Invalid admin access code' });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { username: user.username, email: user.email, role: user.role }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: { username: user.username, email: user.email, role: user.role }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// M-Pesa Functions
async function getMpesaToken() {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
    });
    return response.data.access_token;
}

// M-Pesa STK Push
app.post('/api/mpesa/stkpush', authenticateToken, async (req, res) => {
    try {
        const { phoneNumber, amount, items } = req.body;
        const orderId = 'ORD-' + Date.now();
        
        const token = await getMpesaToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
        
        const stkPushData = {
            BusinessShortCode: MPESA_CONFIG.businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerBuyGoodsOnline',
            Amount: Math.round(amount),
            PartyA: phoneNumber,
            PartyB: MPESA_CONFIG.businessShortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: MPESA_CONFIG.callbackURL,
            AccountReference: orderId,
            TransactionDesc: 'Smart Supply Sourcing Payment'
        };
        
        const response = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, stkPushData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Save order to database
        const order = new Order({
            orderId,
            userId: req.user.userId,
            items,
            totalAmount: amount,
            phoneNumber,
            checkoutRequestID: response.data.CheckoutRequestID,
            status: 'pending'
        });
        
        await order.save();
        
        res.json({
            success: true,
            checkoutRequestID: response.data.CheckoutRequestID,
            orderId
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// M-Pesa Callback
app.post('/api/mpesa/callback', async (req, res) => {
    try {
        const { Body } = req.body;
        const { stkCallback } = Body;
        
        const checkoutRequestID = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;
        
        const order = await Order.findOne({ checkoutRequestID });
        
        if (order) {
            if (resultCode === 0) {
                order.status = 'completed';
                order.mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
            } else {
                order.status = 'failed';
            }
            await order.save();
        }
        
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Order Routes
app.get('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (order) {
            res.json({ status: order.status, order });
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ status: 'completed' })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });
        
        const formattedOrders = orders.map(order => ({
            id: order.orderId,
            customer: order.userId?.username || order.phoneNumber,
            products: order.items.map(item => item.productName).join(', '),
            quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
            amount: order.totalAmount,
            date: order.createdAt.toLocaleDateString(),
            status: 'Completed'
        }));
        
        res.json(formattedOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('MongoDB connected');
    console.log('Till Number: 3788280');
});