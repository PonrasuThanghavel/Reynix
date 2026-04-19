# Reynix Backend Architecture

## Current Request Flow

The backend now follows this pattern for the main refactored domains:

```text
Route -> Middleware -> Controller -> Service -> Model
```

Controllers are intentionally thin.
Business rules live in services.

## Directory Roles

```text
backend/
├── controller/      # HTTP adapters
├── services/        # business logic and transactions
├── model/           # Sequelize models and associations
├── routes/          # route registration
├── middleware/      # validation and rate limiting
├── validation/      # express-validator rules
├── utils/           # helpers, auth, logging, error handling
├── events/          # domain events
└── migrations/      # SQL migration scripts
```

## Controllers

### `userController.js`

Handles:

- registration
- login
- profile read/update
- admin user listing

Delegates to:

- `userService`

### `productController.js`

Handles:

- product list
- product detail
- create
- update
- delete

Delegates to:

- `productService`

Key rule:

- sellers can only update or delete their own products

### `orderController.js`

Handles:

- order creation from cart
- order listing
- order detail
- cancel order
- admin status update

Delegates to:

- `orderService`

Key rule:

- checkout is transactional
- orders are split into seller sub-orders

### `shipmentController.js`

Handles:

- shipment lookup by order
- admin shipment updates

Delegates to:

- `shipmentService`

### `sellerController.js`

Handles seller logistics workflow:

- list seller orders
- pack seller order
- assign shipper

Delegates to:

- `sellerService`

### `shipperController.js`

Handles shipper workflow:

- list assigned shipments
- view restricted shipment detail
- update shipment status
- confirm delivery with OTP

Delegates to:

- `shipmentService`

## Services

### `userService.js`

Responsibilities:

- password hashing
- token issuance
- user sanitization
- profile updates

### `productService.js`

Responsibilities:

- product filtering and pagination
- ownership enforcement
- seller-aware product creation
- inventory bootstrapping on create

### `orderService.js`

Responsibilities:

- checkout transaction
- address validation
- coupon validation
- stock validation and decrement
- order item snapshot creation
- seller order creation
- shipment creation per seller order
- order cancellation and stock restore
- aggregate order status syncing

### `orderService.helpers.js`

- +Responsibilities:
- +- logic for grouping cart items by seller
  +- complex coupon discount calculation logic
  +- aggregate order status derivation from sub-orders
-

### `sellerService.js`

Responsibilities:

- seller order list
- pack workflow
- shipper assignment
- OTP generation and hashing
- seller/customer/shipper notification writes

### `shipmentService.js`

Responsibilities:

- role-aware shipment visibility
- admin shipment updates
- shipper status updates
- delivery OTP verification
- delivery confirmation

## Middleware

### `authMiddleware.js`

Provides:

- `authenticate`
- `authorize(...roles)`

Supported roles:

- `customer`
- `seller`
- `shipper`
- `admin`

### `validateRequest.js`

Runs validation results and attaches sanitized input back to `req.body`, `req.params`, or `req.query`.

### `rateLimit.js`

Provides lightweight in-memory rate limiting for:

- global API traffic
- auth endpoints

## Validation Layer

Validation files are grouped by domain:

- `userValidators.js`
- `productValidators.js`
- `orderValidators.js`
- `shipmentValidators.js`

These run before controllers and reject malformed input early.

## Error Handling

The backend now standardizes errors through:

- `AppError`
- `errorHandler`
- `logger`

Behavior:

- validation errors return field-level details
- auth errors return normalized error codes
- unexpected failures are logged in structured JSON

## Domain Events

The `events/domainEvents.js` emitter is used for future async integrations.

Current event hooks include flows such as:

- `order.created`
- `order.cancelled`
- `seller_order.packed`
- `shipment.assigned`
- `shipment.status_updated`
- `shipment.delivered`

## Backward Compatibility

The refactor preserves existing route contracts where possible.
New logistics behavior was added incrementally through:

- `seller_orders`
- seller-aware products
- shipper-specific endpoints
- richer shipment state
