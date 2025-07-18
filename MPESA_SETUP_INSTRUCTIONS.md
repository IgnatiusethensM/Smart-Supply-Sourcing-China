# M-Pesa Integration Setup Instructions

## 1. Get M-Pesa API Credentials

1. Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an account and login
3. Create a new app for "M-Pesa Express (STK Push)"
4. Get your credentials:
   - Consumer Key
   - Consumer Secret
   - Passkey (for STK Push)

## 2. Update Server Configuration

In `mpesa-server.js`, replace these values:

```javascript
const MPESA_CONFIG = {
    consumerKey: 'YOUR_CONSUMER_KEY',        // From Safaricom Developer Portal
    consumerSecret: 'YOUR_CONSUMER_SECRET',   // From Safaricom Developer Portal
    businessShortCode: '3788280',             // Your till number (already set)
    passkey: 'YOUR_PASSKEY',                 // From Safaricom Developer Portal
    callbackURL: 'https://yourdomain.com/api/mpesa/callback', // Your public URL
    environment: 'sandbox' // Change to 'production' for live payments
};
```

## 3. Setup Callback URL

1. Deploy your server to a public URL (use ngrok for testing)
2. Update the `callbackURL` in the config
3. Register the callback URL in Safaricom Developer Portal

## 4. Install Dependencies

```bash
npm install express cors axios
```

## 5. Run the Server

```bash
node mpesa-server.js
```

## 6. Test the Integration

1. Use sandbox environment first
2. Test with Safaricom test numbers
3. Verify payments appear in admin dashboard

## Your Business Details

- **Till Number**: 3788280
- **Store Number**: 8231249
- **Business Name**: Smart Supply Sourcing China

## Important Notes

- Payments go directly to your M-Pesa till number 3788280
- Orders automatically appear in admin dashboard after successful payment
- M-Pesa API handles all payment processing and verification
- Real-time payment status updates via webhooks