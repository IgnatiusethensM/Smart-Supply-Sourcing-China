# Smart Supply Sourcing China

A backend API system for supply chain management and sourcing from Chinese suppliers.

## What You Can See in This Repository

### 🏗️ **Project Structure**
```
├── server.js           # Main Express.js server application
├── package.json        # Node.js dependencies and project configuration
├── package-lock.json   # Dependency version lock file
└── node_modules/       # Installed dependencies
```

### 🛠️ **Technology Stack**
- **Runtime**: Node.js
- **Web Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM v8.16.2
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs hashing
- **Real-time Communication**: Socket.IO v4.8.1
- **HTTP Client**: Axios v1.10.0
- **Session Management**: Express Session with Cookie Parser
- **Cross-Origin Support**: CORS enabled
- **Utilities**: Moment.js for date handling, UUID for unique identifiers

### 🔐 **Authentication System**
- User registration and login with encrypted passwords
- JWT token-based authentication (24-hour expiration)
- Role-based access control (User/Admin roles)
- Admin access protected with special access code
- Secure password hashing using bcryptjs

### 📊 **Database Models**

#### User Schema
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date (auto-generated)
}
```

#### Product Schema
```javascript
{
  name: String,
  category: String,
  price: Number,
  image: String (URL),
  description: String
}
```

### 🌐 **API Endpoints**

#### Authentication Routes
- `POST /api/auth/register` - User registration (supports admin registration with access code)
- `POST /api/auth/login` - User login with email/password
- `GET /api/auth/me` - Get current user profile (requires authentication)

#### Product Management Routes
- `GET /api/products` - Retrieve all products (public access)
- `POST /api/products` - Create new product (admin only)
- `DELETE /api/products/:id` - Delete product by ID (admin only)
- `POST /api/products/seed` - Populate database with sample products

### 📦 **Sample Product Categories**
The system includes sample data for various product types:
- **Electronics**: Wireless Headphones ($299.99)
- **Clothing**: Cotton T-Shirt ($49.99)
- **Home Appliances**: Coffee Maker ($199.99)
- **Machinery**: Industrial Pump ($999.99)

### ⚡ **Real-time Features**
- Socket.IO server configured for real-time communication
- CORS enabled for cross-origin WebSocket connections
- Ready for live chat, notifications, or real-time updates

### 🔧 **Configuration**
- **Server Port**: 5000 (configurable via PORT environment variable)
- **MongoDB**: Configured for `mongodb://localhost:27017/smart-supply`
- **JWT Secret**: Currently hardcoded (should be environment variable in production)
- **Admin Access Code**: `admin123` (for admin user registration)

### 🚀 **Getting Started**

#### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)

#### Installation
```bash
npm install
```

#### Running the Server
```bash
node server.js
```

The server will start on port 5000 and connect to MongoDB. Visit `http://localhost:5000/api/products/seed` to populate the database with sample products.

### 📋 **Available Scripts**
- `npm test` - Currently configured but not implemented

### 🔍 **Current Capabilities**
✅ User authentication and authorization  
✅ Product catalog management  
✅ RESTful API endpoints  
✅ Database integration with MongoDB  
✅ Real-time communication setup  
✅ Sample data seeding  
✅ Role-based permissions  
✅ CORS support for frontend integration  

### 🚧 **Missing Components**
❌ Frontend application  
❌ API documentation (Swagger/OpenAPI)  
❌ Unit and integration tests  
❌ Environment configuration (.env)  
❌ Docker containerization  
❌ Production deployment configuration  
❌ Data validation and error handling middleware  
❌ Logging system  
❌ Rate limiting and security headers  

### 🎯 **Intended Use Case**
This backend API appears designed for a supply chain sourcing platform that connects businesses with Chinese suppliers. It provides the foundational infrastructure for:
- User management and authentication
- Product catalog browsing and management
- Real-time communication between buyers and suppliers
- Administrative control over product listings

### 🔮 **Potential Enhancements**
- Add comprehensive input validation
- Implement API rate limiting
- Add detailed logging and monitoring
- Create comprehensive test suite
- Add environment-based configuration
- Implement advanced search and filtering
- Add file upload capabilities for product images
- Integrate with payment processing
- Add supplier management features
- Implement order management system

---

*This repository contains the backend foundation for a smart supply sourcing platform focused on Chinese market integration.*