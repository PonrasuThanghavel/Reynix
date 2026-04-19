# Reynix Backend Models

## Overview

All Sequelize models live in `backend/model/`.
Associations are registered in `backend/model/index.js`.

## Core Models

### `User`

Purpose:

- platform identity and authorization

Important fields:

- `id`
- `full_name`
- `email`
- `phone_number`
- `password_hash`
- `role`
- `is_verified`
- `is_active`
- `last_login_at`
- `deleted_at`

Allowed roles:

- `customer`
- `seller`
- `shipper`
- `admin`

### `UserAddress`

Purpose:

- customer shipping and billing addresses

Important fields:

- `user_id`
- `full_name`
- `phone_number`
- `address_line1`
- `address_line2`
- `city`
- `state`
- `postal_code`
- `country`
- `is_default`

### `Category`

Purpose:

- product categorization with parent/child nesting

Important fields:

- `name`
- `slug`
- `parent_id`
- `sort_order`
- `is_active`

### `Brand`

Purpose:

- brand master data for products

Important fields:

- `name`
- `slug`
- `logo_url`
- `website_url`
- `is_active`

### `Product`

Purpose:

- sellable catalog entity

Important fields:

- `id`
- `name`
- `slug`
- `category_id`
- `brand_id`
- `seller_id`
- `base_price`
- `selling_price`
- `discount_percent`
- `tax_percent`
- `sku`
- `status`
- `is_featured`
- `average_rating`
- `review_count`
- `deleted_at`

Important rule:

- `seller_id` is the ownership boundary for seller mutations

### `ProductImage`

Purpose:

- ordered product media

Important fields:

- `product_id`
- `image_url`
- `alt_text`
- `sort_order`
- `is_primary`

### `ProductVariant`

Purpose:

- variant-specific catalog options

Important fields:

- `product_id`
- `variant_name`
- `sku`
- `attributes`
- `selling_price`
- `price_modifier`
- `is_active`

### `Inventory`

Purpose:

- stock tracking at product or variant level

Important fields:

- `product_id`
- `variant_id`
- `quantity`
- `reserved_quantity`
- `warehouse_location`
- `low_stock_threshold`

### `Cart`

Purpose:

- active shopping container for a user

Important fields:

- `user_id`
- `coupon_id`
- `status`

Statuses:

- `active`
- `merged`
- `abandoned`

### `CartItem`

Purpose:

- line items in a cart

Important fields:

- `cart_id`
- `product_id`
- `variant_id`
- `quantity`
- `unit_price`

### `Order`

Purpose:

- customer-facing order record

Important fields:

- `user_id`
- `order_number`
- `status`
- `shipping_address_id`
- `billing_address_id`
- `coupon_id`
- `subtotal`
- `discount_amount`
- `tax_amount`
- `shipping_charge`
- `total_amount`
- `notes`
- `cancelled_at`
- `cancellation_reason`

Statuses:

- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`
- `returned`

### `SellerOrder`

Purpose:

- seller-scoped sub-order derived from a parent order

Important fields:

- `order_id`
- `seller_id`
- `status`

Statuses:

- `pending`
- `packed`
- `assigned`
- `shipped`
- `delivered`
- `cancelled`

This model is the key to multi-vendor fulfillment.

### `OrderItem`

Purpose:

- immutable order line snapshot

Important fields:

- `order_id`
- `seller_order_id`
- `seller_id`
- `product_id`
- `variant_id`
- `product_name`
- `variant_name`
- `quantity`
- `unit_price`
- `discount_amount`
- `tax_amount`
- `total_price`

### `Payment`

Purpose:

- payment attempts and gateway state

Important fields:

- `order_id`
- `user_id`
- `method`
- `provider`
- `status`
- `amount`
- `currency`
- `gateway_transaction_id`
- `gateway_response`
- `paid_at`
- `refunded_at`
- `refund_amount`

### `Shipment`

Purpose:

- fulfillment and delivery tracking

Important fields:

- `order_id`
- `seller_order_id`
- `shipper_id`
- `tracking_number`
- `carrier`
- `status`
- `assigned_at`
- `estimated_delivery_date`
- `delivery_otp`
- `delivery_confirmed`
- `delivered_at`
- `shipping_label_url`
- `notes`

Statuses:

- `pending`
- `dispatched`
- `in_transit`
- `out_for_delivery`
- `delivered`
- `failed`

Important rule:

- `delivery_otp` stores a hash, not the raw OTP

### `Review`

Purpose:

- customer review and verified purchase linkage

### `Wishlist`

Purpose:

- saved customer products and variants

### `Coupon`

Purpose:

- promotional discounts with usage controls

Important fields:

- `code`
- `discount_type`
- `discount_value`
- `min_order_amount`
- `max_discount_cap`
- `usage_limit`
- `usage_count`
- `per_user_limit`
- `valid_from`
- `valid_until`
- `is_active`

### `Notification`

Purpose:

- in-app user notifications

Types:

- `order_update`
- `shipment_update`
- `promo`
- `review_reply`
- `restock`

## Important Associations

- `User -> Product` as seller-owned products
- `User -> SellerOrder` as seller orders
- `User -> Shipment` as assigned shipper shipments
- `Order -> SellerOrder`
- `SellerOrder -> OrderItem`
- `SellerOrder -> Shipment`
- `Order -> Shipment`
- `Product -> Inventory`
- `ProductVariant -> Inventory`

## Index Notes

Key performance indexes now include:

- `users(role)`
- `products(seller_id)`
- `products(seller_id, status)`
- `seller_orders(order_id)`
- `seller_orders(seller_id)`
- `seller_orders(seller_id, status)`
- `order_items(seller_order_id)`
- `shipments(shipper_id)`
- `shipments(shipper_id, status)`

These support the new seller and shipper workflows efficiently.
