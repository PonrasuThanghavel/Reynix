ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS products_seller_id_idx ON products(seller_id);
CREATE INDEX IF NOT EXISTS products_seller_id_status_idx ON products(seller_id, status);

CREATE TABLE IF NOT EXISTS seller_orders (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seller_orders_order_id_idx ON seller_orders(order_id);
CREATE INDEX IF NOT EXISTS seller_orders_seller_id_idx ON seller_orders(seller_id);
CREATE INDEX IF NOT EXISTS seller_orders_status_idx ON seller_orders(status);
CREATE INDEX IF NOT EXISTS seller_orders_seller_id_status_idx ON seller_orders(seller_id, status);

ALTER TABLE IF EXISTS order_items
ADD COLUMN IF NOT EXISTS seller_order_id BIGINT REFERENCES seller_orders(id),
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS order_items_seller_order_id_idx ON order_items(seller_order_id);
CREATE INDEX IF NOT EXISTS order_items_seller_id_idx ON order_items(seller_id);

ALTER TABLE IF EXISTS shipments
ADD COLUMN IF NOT EXISTS seller_order_id BIGINT REFERENCES seller_orders(id),
ADD COLUMN IF NOT EXISTS shipper_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_otp TEXT,
ADD COLUMN IF NOT EXISTS delivery_confirmed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS shipments_order_id_idx ON shipments(order_id);
CREATE INDEX IF NOT EXISTS shipments_seller_order_id_idx ON shipments(seller_order_id);
CREATE INDEX IF NOT EXISTS shipments_shipper_id_idx ON shipments(shipper_id);
CREATE INDEX IF NOT EXISTS shipments_shipper_id_status_idx ON shipments(shipper_id, status);
