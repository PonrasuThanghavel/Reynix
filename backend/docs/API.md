# Reynix Backend API Documentation

Base URL: `http://localhost:5000/api`

## Overview

Reynix is a multi-role e-commerce backend built with Express 5, PostgreSQL, and Sequelize. It supports JWT authentication, rate limiting, and an MVC architecture.

### Platform Roles
- `customer`: Can browse products, manage cart, and place orders.
- `seller`: Can manage their own products and fulfill seller orders.
- `shipper`: Can update shipment statuses and confirm delivery.
- `admin`: Full access to the platform.

---

## Response Format

All API responses follow a consistent shape:

**Success Response:**
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {
    "key": "value"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Description of the error",
  "errors": []
}
```

---

## Authentication

Protected routes require a JWT token passed in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

---

## Key Endpoints with Examples

### 1. User Registration
`POST /users/register`

Register a new user on the platform.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "johndoe@example.com",
  "password": "SecurePassword123!",
  "role": "customer" // optional, defaults to customer. Allowed: customer, seller, shipper, admin
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "full_name": "John Doe",
      "email": "johndoe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### 2. User Login
`POST /users/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "johndoe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

---

### 3. Create a Product
`POST /products`
*(Requires Auth: Seller or Admin)*

Sellers can add products to the catalog. It automatically creates initial inventory.

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "High quality noise-cancelling headphones.",
  "short_description": "Noise-cancelling headphones",
  "category_id": 1,
  "brand_id": 2,
  "base_price": 150.00,
  "selling_price": 120.00,
  "discount_percent": 20,
  "initial_stock": 50,
  "status": "active"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "product": {
      "id": "uuid-here",
      "name": "Wireless Headphones",
      "slug": "wireless-headphones",
      "seller_id": "seller-uuid",
      "selling_price": "120.00"
    }
  }
}
```

---

### 4. Fetch Products
`GET /products?page=1&limit=10&sort=price_asc`
*(Public)*

List products with optional pagination and filtering.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Products fetched",
  "data": {
    "products": [
      {
        "id": "uuid-here",
        "name": "Wireless Headphones",
        "slug": "wireless-headphones",
        "selling_price": "120.00",
        "category": { "name": "Electronics" },
        "brand": { "name": "AudioTech" }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 5. Add to Cart
`POST /cart/items`
*(Requires Auth: Customer)*

Add a product to the user's active cart.

**Request Body:**
```json
{
  "product_id": "uuid-of-product",
  "quantity": 2
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "item": {
      "id": "uuid-here",
      "cart_id": "cart-uuid",
      "product_id": "product-uuid",
      "quantity": 2,
      "unit_price": "120.00"
    }
  }
}
```

---

### 6. Checkout / Place Order
`POST /orders`
*(Requires Auth: Customer)*

Creates an order from the active cart, clears the cart, decrements inventory, and splits the order among sellers if necessary.

**Request Body:**
```json
{
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "notes": "Please leave at front door."
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed",
  "data": {
    "order": {
      "id": "uuid-order-id",
      "order_number": "ORD-12345678",
      "status": "pending",
      "subtotal": "240.00",
      "tax_amount": "43.20",
      "total_amount": "283.20",
      "items": [
        {
          "product_name": "Wireless Headphones",
          "quantity": 2,
          "total_price": "240.00"
        }
      ]
    }
  }
}
```

---

---

### 7. Inventory Management
`GET /inventory/product/:productId`
*(Requires Auth: Seller or Admin)*

Fetch the inventory levels for a specific product.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Inventory fetched",
  "data": {
    "inventory": {
      "id": 1,
      "product_id": "uuid-here",
      "quantity": 48,
      "low_stock_threshold": 10
    }
  }
}
```

---

### 8. Coupons & Promotions
`POST /coupons/validate`
*(Requires Auth)*

Validate a coupon code against a subtotal.

**Request Body:**
```json
{
  "code": "SAVE20",
  "subtotal": 500.00
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "coupon": {
      "id": 1,
      "code": "SAVE20",
      "discount_type": "percent",
      "discount_value": "20.00"
    },
    "discount_amount": 100.00
  }
}
```

---

### 9. Product Reviews
`POST /reviews`
*(Requires Auth: Customer)*

Submit a review for a purchased product.

**Request Body:**
```json
{
  "product_id": "uuid-here",
  "order_item_id": 1,
  "rating": 5,
  "title": "Amazing Sound!",
  "body": "These headphones are life-changing."
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "id": 1,
      "rating": 5,
      "title": "Amazing Sound!"
    }
  }
}
```

---

### 10. Notifications
`GET /notifications`
*(Requires Auth)*

Fetch in-app notifications for the current user.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications fetched",
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "order_update",
        "title": "Order Shipped",
        "message": "Your order ORD-12345 has been shipped!",
        "is_read": false
      }
    ]
  }
}
```

---

## Other Important Modules

- **Addresses** (`/addresses`): CRUD operations for user addresses. Must create an address before placing an order.
- **Categories & Brands** (`/categories`, `/brands`): Admins manage taxonomy; public endpoints available for listing.
- **Shipments** (`/shipments`, `/shipper`): Sellers assign shippers. Shippers update statuses (`dispatched`, `in_transit`) and confirm delivery using OTP.
- **Inventory** (`/inventory`): Tracking stock. `createProduct` initializes stock automatically. Placing an order strictly decrements it.
- **Reviews & Wishlists** (`/reviews`, `/wishlist`): Community interaction endpoints.

## Error Handling Example

If a customer tries to place an order but the item is out of stock:

**Response (400 Bad Request):**
```json
{
  "success": false,
  "code": "INSUFFICIENT_STOCK",
  "message": "Insufficient stock for Wireless Headphones"
}
```

If a user tries to access a protected route without a token:

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Authentication required. Please provide a valid token."
}
```
