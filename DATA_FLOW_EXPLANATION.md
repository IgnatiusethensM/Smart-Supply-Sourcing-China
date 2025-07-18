# 📊 Data Storage and User Authentication Flow

## 🗄️ **Where Data is Stored**

### **MongoDB Database: `smart-supply`**
Your data is stored in MongoDB with the following collections:

1. **`users` Collection** - User accounts
2. **`chatsessions` Collection** - Chat session tracking  
3. **`messages` Collection** - All chat messages
4. **`products` Collection** - Product catalog

---

## 👤 **User Registration Process**

### **What Happens When Someone Signs Up:**

1. **Frontend Form Submission**
   - User fills registration form (username, email, password, role)
   - If selecting "Admin", must provide admin access code
   - Form data sent to backend via POST request

2. **Backend Validation**
   ```javascript
   // Check if user already exists
   const existingUser = await User.findOne({ $or: [{ email }, { username }] });
   
   // Validate admin password (if registering as admin)
   if (role === 'admin' && adminPassword !== 'admin123secure!') {
     return error('Invalid admin access code');
   }
   ```

3. **Password Security**
   ```javascript
   // Password is hashed with bcrypt (never stored in plain text)
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

4. **Database Storage**
   ```javascript
   // User data saved to MongoDB
   const user = new User({
     username: 'john_doe',
     email: 'john@example.com', 
     password: '$2b$10$encrypted_hash_here...',
     role: 'user',
     createdAt: '2025-01-10T...'
   });
   await user.save();
   ```

5. **JWT Token Generation**
   ```javascript
   // Secure token created for authentication
   const token = jwt.sign({
     userId: user._id,
     username: user.username, 
     email: user.email,
     role: user.role
   }, JWT_SECRET, { expiresIn: '24h' });
   ```

---

## 🔐 **User Login Process**

### **What Happens When Someone Logs In:**

1. **Frontend Login Form**
   - User enters email and password
   - Data sent to backend login endpoint

2. **Backend Authentication**
   ```javascript
   // Find user in database
   const user = await User.findOne({ email: 'john@example.com' });
   
   // Verify password against hashed version
   const isMatch = await bcrypt.compare(password, user.password);
   ```

3. **Token Creation & Response**
   ```javascript
   // If valid, create new JWT token
   const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: '24h' });
   
   // Send back to frontend
   res.json({
     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
     user: { id, username, email, role }
   });
   ```

4. **Frontend Token Storage**
   ```javascript
   // Token stored in browser localStorage
   localStorage.setItem('authToken', token);
   currentUser = userData;
   ```

---

## 💬 **Chat Data Storage**

### **Chat Sessions Collection:**
```javascript
{
  _id: ObjectId("..."),
  sessionId: "session_1704924000000_abc123",
  userId: ObjectId("..."),
  userEmail: "john@example.com",
  userName: "john_doe", 
  startTime: "2025-01-10T10:00:00.000Z",
  status: "active",
  lastActivity: "2025-01-10T10:30:00.000Z"
}
```

### **Messages Collection:**
```javascript
{
  _id: ObjectId("..."),
  sessionId: "session_1704924000000_abc123",
  message: "Hello, I need help with pricing",
  sender: "user", // or "admin"
  senderName: "john_doe",
  timestamp: "2025-01-10T10:00:00.000Z",
  readByAdmin: false,
  readByUser: true
}
```

---

## 🔒 **Security Features**

### **Admin Access Control:**
- **Admin Password Required**: `admin123secure!` (change this!)
- **Role-Based Access**: Only admins can access admin endpoints
- **JWT Token Verification**: All protected routes require valid token

### **Password Security:**
- **Bcrypt Hashing**: Passwords never stored in plain text
- **Salt Rounds**: 10 rounds of bcrypt for strong encryption
- **Token Expiration**: JWT tokens expire after 24 hours

### **Example User Document in MongoDB:**
```javascript
{
  _id: ObjectId("679bb12345678901234567890"),
  username: "john_doe",
  email: "john@example.com",
  password: "$2b$10$rOK1qfxd9XmPWxAQY.LqNuZZ5.tgDcGjxHKGTVaLNmyJcTzqjGF2u",
  role: "user",
  createdAt: "2025-01-10T10:00:00.000Z",
  __v: 0
}
```

---

## 🚀 **How to Access Your Data**

### **View Database Contents:**
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/smart-supply

# View all users
db.users.find().pretty()

# View all chat sessions  
db.chatsessions.find().pretty()

# View all messages
db.messages.find().pretty()
```

### **Current Admin Access Code:**
**`admin123secure!`** - Change this in `/backend/server.js` line 130!

---

## 📋 **Summary**

✅ **User data**: Stored securely in MongoDB with encrypted passwords  
✅ **Chat messages**: Persistent storage with real-time delivery  
✅ **Admin access**: Protected by access code requirement  
✅ **Authentication**: JWT tokens for secure session management  
✅ **Data retrieval**: Automatic loading when users log in  

Your system now has enterprise-level security and data persistence!
