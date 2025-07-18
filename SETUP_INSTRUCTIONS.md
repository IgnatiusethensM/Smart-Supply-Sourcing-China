# Smart Supply Sourcing China - Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Install MongoDB

### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

### Alternative - MongoDB Atlas (Cloud):
1. Create account at https://www.mongodb.com/atlas
2. Create cluster and get connection string
3. Replace connection string in `server.js`

## 3. Start the Server

```bash
npm start
# or for development
npm run dev
```

## 4. Database Collections

The server will automatically create:
- **users** - User accounts with authentication
- **orders** - M-Pesa payment orders

## 5. Test Authentication

### Register Admin:
- Username: admin
- Email: admin@smartsupply.com
- Password: admin123
- Role: Admin
- Admin Code: admin123

### Register User:
- Any username/email/password
- Role: User

## 6. M-Pesa Configuration

Update `server.js` with your M-Pesa credentials:
```javascript
const MPESA_CONFIG = {
    consumerKey: 'YOUR_CONSUMER_KEY',
    consumerSecret: 'YOUR_CONSUMER_SECRET',
    businessShortCode: '3788280', // Your till number
    passkey: 'YOUR_PASSKEY',
    callbackURL: 'https://yourdomain.com/api/mpesa/callback'
};
```

## 7. Features

✅ **User Registration/Login** - Stored in MongoDB
✅ **JWT Authentication** - Secure token-based auth
✅ **Password Hashing** - bcrypt encryption
✅ **M-Pesa Integration** - Real payments to till 3788280
✅ **Order Management** - Orders stored in database
✅ **Admin Dashboard** - View completed orders

## 8. API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/mpesa/stkpush` - Initiate M-Pesa payment
- `POST /api/mpesa/callback` - M-Pesa webhook
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id/status` - Check order status