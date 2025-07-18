# API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
The API uses JWT (JSON Web Token) based authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user|admin" (optional, defaults to "user"),
  "adminPassword": "string" (required if role is "admin")
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "role": "user|admin"
  }
}
```

**Error Responses:**
- `400`: User already exists or invalid admin access code
- `500`: Server error

---

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "role": "user|admin"
  }
}
```

**Error Responses:**
- `400`: Invalid credentials
- `500`: Server error

---

#### Get Current User
```http
GET /api/auth/me
```

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "_id": "user_id",
  "username": "username",
  "email": "email",
  "role": "user|admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401`: Access token required
- `403`: Invalid or expired token
- `500`: Server error

---

### Products

#### Get All Products
```http
GET /api/products
```

**Response (200):**
```json
[
  {
    "_id": "product_id",
    "name": "Product Name",
    "category": "Category",
    "price": 99.99,
    "image": "https://image-url.com/image.jpg",
    "description": "Product description"
  }
]
```

**Error Responses:**
- `500`: Server error

---

#### Create Product (Admin Only)
```http
POST /api/products
```

**Headers Required:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "name": "string",
  "category": "string",
  "price": "number",
  "image": "string (URL)",
  "description": "string"
}
```

**Response (201):**
```json
{
  "_id": "product_id",
  "name": "Product Name",
  "category": "Category",
  "price": 99.99,
  "image": "https://image-url.com/image.jpg",
  "description": "Product description"
}
```

**Error Responses:**
- `401`: Access token required
- `403`: Invalid token or admin access required
- `500`: Server error

---

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
```

**Headers Required:**
```
Authorization: Bearer <admin_jwt_token>
```

**URL Parameters:**
- `id`: Product ID

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Error Responses:**
- `401`: Access token required
- `403`: Invalid token or admin access required
- `500`: Server error

---

#### Seed Sample Products
```http
POST /api/products/seed
```

This endpoint populates the database with sample products if no products exist.

**Response (200):**
```json
{
  "message": "Sample products added",
  "count": 4
}
```

Or if products already exist:
```json
{
  "message": "Products already exist",
  "count": 4
}
```

**Error Responses:**
- `500`: Server error

---

## Sample Products Data

The seed endpoint creates these sample products:

1. **Wireless Headphones**
   - Category: Electronics
   - Price: $299.99
   - Description: High-quality wireless headphones with noise cancellation

2. **Cotton T-Shirt**
   - Category: Clothing
   - Price: $49.99
   - Description: Comfortable cotton t-shirt in various colors

3. **Coffee Maker**
   - Category: Home Appliances
   - Price: $199.99
   - Description: Automatic coffee maker with programmable timer

4. **Industrial Pump**
   - Category: Machinery
   - Price: $999.99
   - Description: Heavy-duty industrial water pump

## Error Handling

All endpoints return errors in the following format:
```json
{
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

## Authentication Flow

1. **Register/Login** to get JWT token
2. **Include token** in Authorization header for protected routes
3. **Admin routes** require admin role in the JWT payload
4. **Tokens expire** after 24 hours

## Rate Limiting

Currently, no rate limiting is implemented.

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins with GET and POST methods.