# Reynix Backend Utilities

## Overview

Utilities and cross-cutting helpers live in:

```text
backend/
├── utils/
├── middleware/
├── validation/
└── events/
```

## `utils/authMiddleware.js`

Provides:

- `authenticate`
- `authorize(...roles)`

Responsibilities:

- parse Bearer token
- verify JWT
- load active user
- attach sanitized user to `req.user`
- block unauthorized roles

Supported roles:

- `customer`
- `seller`
- `shipper`
- `admin`

## `utils/helpers.js`

Provides:

- `generateOrderNumber()`
- `slugify(text)`
- `apiResponse(res, statusCode, success, message, data, meta)`

Usage notes:

- `generateOrderNumber()` creates human-readable order IDs
- `slugify()` is used by catalog domains
- `apiResponse()` keeps controller responses consistent

## `utils/appError.js`

Custom application error class.

Fields:

- `message`
- `statusCode`
- `code`
- `details`

Use this for predictable API failures instead of throwing raw errors.

## `utils/errorHandler.js`

Global Express error middleware.

Responsibilities:

- structured JSON error output
- error code normalization
- Sequelize validation handling
- JWT error handling
- application error handling
- structured error logging

## `utils/logger.js`

Lightweight structured logger.

Methods:

- `info`
- `warn`
- `error`

Output format:

- JSON lines with level, message, timestamp, and metadata

## `utils/otp.js`

Provides delivery OTP helpers:

- `generateDeliveryOtp()`
- `hashOtp(otp)`
- `verifyOtp(otp, hash)`

Used by:

- seller shipper-assignment flow
- shipper delivery confirmation flow

## `middleware/validateRequest.js`

Runs `express-validator` checks and returns:

- normalized validation failure responses
- sanitized request data

## `middleware/rateLimit.js`

Provides in-memory rate limiting middleware.

Used for:

- auth endpoints
- global API throttling

## `validation/*.js`

Validation is split by domain:

- `userValidators.js`
- `productValidators.js`
- `orderValidators.js`
- `shipmentValidators.js`

These validators protect:

- auth input
- product mutations
- checkout payloads
- seller logistics actions
- shipper shipment actions

## `events/domainEvents.js`

In-process event emitter for domain hooks.

Current event categories:

- order lifecycle
- seller order lifecycle
- shipment lifecycle

This is intentionally simple and ready to be replaced or bridged by:

- Kafka
- RabbitMQ
- background workers
## `services/orderService.helpers.js`
+
+Internal business logic helpers:
+
+- `groupCartItemsBySeller(items)`: Groups an array of cart items into a Map keyed by `seller_id`.
+- `calculateCouponDiscount(subtotal, coupon)`: Handles flat and percentage discount logic with optional caps.
+- `deriveOrderStatus(sellerOrders)`: Determines the aggregate parent order status (e.g., if one item is shipped, the order is 'shipped').
+
