const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// M-Pesa Configuration - Replace with your actual credentials
const MPESA_CONFIG = {
    consumerKey: 'YOUR_CONSUMER_KEY',
    consumerSecret: 'YOUR_CONSUMER_SECRET', 
    businessShortCode: '3788280', // Your till number
    passkey: 'YOUR_PASSKEY',
    callbackURL: 'https://yourdomain.com/api/mpesa/callback',
    environment: 'sandbox' // Change to 'production' for live
};

const MPESA_BASE_URL = MPESA_CONFIG.environment === 'sandbox' 
    ? 'https://sandbox.safaricom.co.ke' 
    : 'https://api.safaricom.co.ke';

let orders = [];

// Get M-Pesa access token
async function getMpesaToken() {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
    });
    return response.data.access_token;
}

// Initiate STK Push
app.post('/api/mpesa/stkpush', async (req, res) => {
    const { phoneNumber, amount, orderId, items } = req.body;
    
    try {
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
        
        // Store pending order
        orders.push({
            orderId,
            items,
            amount,
            phoneNumber,
            status: 'pending',
            checkoutRequestID: response.data.CheckoutRequestID,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            checkoutRequestID: response.data.CheckoutRequestID,
            orderId
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// M-Pesa callback endpoint
app.post('/api/mpesa/callback', (req, res) => {
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    
    const orderIndex = orders.findIndex(order => order.checkoutRequestID === checkoutRequestID);
    
    if (orderIndex !== -1) {
        if (resultCode === 0) {
            orders[orderIndex].status = 'completed';
            orders[orderIndex].mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        } else {
            orders[orderIndex].status = 'failed';
        }
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// Get order status
app.get('/api/orders/:orderId/status', (req, res) => {
    const order = orders.find(o => o.orderId === req.params.orderId);
    if (order) {
        res.json({ status: order.status, order });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Get all completed orders for admin dashboard
app.get('/api/orders', (req, res) => {
    const completedOrders = orders.filter(order => order.status === 'completed').map(order => ({
        id: order.orderId,
        customer: order.phoneNumber,
        products: order.items.map(item => item.productName).join(', '),
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        amount: order.amount,
        date: new Date(order.timestamp).toLocaleDateString(),
        status: 'Completed'
    }));
    res.json(completedOrders);
});

app.listen(3000, () => {
    console.log('M-Pesa server running on port 3000');
    console.log('Till Number: 3788280');
    console.log('Store Number: 8231249');
});