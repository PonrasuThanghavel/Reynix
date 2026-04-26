import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import {
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineShoppingCart,
  HiOutlineArrowRight,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";
import "./Cart.css";

function Cart() {
  const { user } = useAuth();
  const { items, itemCount, subtotal, loading, updateItem, removeItem, clearCart } =
    useCart();
  const [updatingId, setUpdatingId] = useState(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const handleQuantityChange = async (itemId, newQty) => {
    setUpdatingId(itemId);
    try {
      await updateItem(itemId, newQty);
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId, productName) => {
    setUpdatingId(itemId);
    try {
      await removeItem(itemId);
      toast.success(`Removed "${productName}" from cart`);
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="cart-page">
        <h1>Cart</h1>
        <div className="cart-login-prompt">
          <HiOutlineLockClosed />
          <h3>Sign in to view your cart</h3>
          <p>You need to be logged in to add items and view your cart.</p>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading && items.length === 0) {
    return (
      <div className="cart-page">
        <h1>Cart</h1>
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1>Cart</h1>
        <div className="cart-empty">
          <HiOutlineShoppingCart />
          <h3>Your cart is empty</h3>
          <p>Browse our products and add something you love!</p>
          <Link to="/products">Browse Products</Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <h1>
        Cart <span>({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
      </h1>

      <div className="cart-layout">
        {/* ── Items ── */}
        <div className="cart-items">
          {items.map((item) => {
            const unitPrice = Number.parseFloat(item.unit_price) || 0;
            const lineTotal = unitPrice * (item.quantity || 0);
            const productName = item.product?.name || "Product";
            const isUpdating = updatingId === item.id;

            return (
              <div
                className="cart-item"
                key={item.id}
                style={isUpdating ? { opacity: 0.6, pointerEvents: "none" } : {}}
              >
                <div className="cart-item-image">
                  {item.product?.images?.[0]?.image_url ? (
                    <img src={item.product.images[0].image_url} alt={productName} />
                  ) : (
                    <HiOutlinePhotograph />
                  )}
                </div>

                <div className="cart-item-info">
                  <Link
                    to={`/products/${item.product_id}`}
                    className="cart-item-name"
                  >
                    {productName}
                  </Link>

                  {item.variant && (
                    <span className="cart-item-variant">
                      {item.variant.variant_name}
                    </span>
                  )}

                  <span className="cart-item-price">
                    {formatPrice(unitPrice)} each
                  </span>

                  <div className="cart-item-actions">
                    <div className="cart-item-quantity">
                      <button
                        className="cart-qty-btn"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <HiOutlineMinus />
                      </button>
                      <div className="cart-qty-value">{item.quantity}</div>
                      <button
                        className="cart-qty-btn"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        <HiOutlinePlus />
                      </button>
                    </div>

                    <button
                      className="cart-item-remove"
                      onClick={() => handleRemove(item.id, productName)}
                    >
                      <HiOutlineTrash /> Remove
                    </button>

                    <div className="cart-item-total">
                      <span className="cart-item-total-price">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button className="cart-clear-btn" onClick={handleClear}>
            <HiOutlineTrash /> Clear Cart
          </button>
        </div>

        {/* ── Summary ── */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span className="label">Subtotal ({itemCount} items)</span>
            <span className="value">{formatPrice(subtotal)}</span>
          </div>

          <div className="cart-summary-row">
            <span className="label">Shipping</span>
            <span className="value" style={shipping === 0 ? { color: "var(--accent-success)" } : {}}>
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </span>
          </div>

          {shipping > 0 && (
            <div className="cart-summary-row">
              <span className="label" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Free shipping on orders ≥ ₹999
              </span>
            </div>
          )}

          <div className="cart-summary-divider" />

          <div className="cart-summary-total">
            <span className="label">Total</span>
            <span className="value">{formatPrice(total)}</span>
          </div>

          <Link to="/checkout" className="cart-checkout-btn" id="checkout-btn" style={{textDecoration: 'none'}}>
            Proceed to Checkout <HiOutlineArrowRight />
          </Link>

          <Link to="/products" className="cart-continue-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
