import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { addressAPI, orderAPI } from "../../api/orders";
import toast from "react-hot-toast";
import {
  HiOutlineMapPin,
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";
import { FaCcVisa, FaCcStripe } from "react-icons/fa";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, itemCount, subtotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" or "card"
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    full_name: user?.full_name || "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, items.length]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressAPI.getAddresses();
      const fetchedAddresses = res.data.data.addresses || [];
      setAddresses(fetchedAddresses);
      
      if (fetchedAddresses.length > 0) {
        // Find default or fallback to first
        const def = fetchedAddresses.find((a) => a.is_default);
        setSelectedAddressId(def ? def.id : fetchedAddresses[0].id);
      } else {
        setShowAddressForm(true);
      }
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addressAPI.createAddress({
        ...addressData,
        is_default: addresses.length === 0, // Auto default if first
      });
      const newAddress = res.data.data.address;
      setAddresses((prev) => [newAddress, ...prev]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      toast.success("Address added");
    } catch {
      toast.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setPlacingOrder(true);
    try {
      // Create the order via backend
      // We only pass shipping_address_id based on validation
      const payload = {
        shipping_address_id: selectedAddressId,
        notes: paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment",
      };

      const res = await orderAPI.createOrder(payload);
      
      // If payment was implemented, we'd redirect to Stripe/payment gateway here.
      // For now, assume success and clear cart
      await clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        {/* ── Left Column: Checkout Steps ── */}
        <div className="checkout-steps">
          
          {/* Step 1: Address */}
          <div className="checkout-section">
            <h2>
              <HiOutlineMapPin /> 1. Delivery Address
            </h2>

            {!showAddressForm ? (
              <div className="address-grid">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddressId === addr.id ? "selected" : ""}`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    {addr.is_default && <span className="address-label">Default</span>}
                    <div className="address-name">{addr.full_name}</div>
                    <div className="address-text">
                      {addr.address_line1}
                      {addr.address_line2 && <>, {addr.address_line2}</>}
                      <br />
                      {addr.city}, {addr.state} {addr.postal_code}
                    </div>
                    <div className="address-phone">{addr.phone_number}</div>
                  </div>
                ))}

                <button
                  className="checkout-add-address-btn"
                  onClick={() => setShowAddressForm(true)}
                >
                  <HiOutlinePlus size={24} />
                  Add New Address
                </button>
              </div>
            ) : (
              <form className="address-form" onSubmit={handleAddressSave}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={addressData.full_name}
                    onChange={(e) => setAddressData({ ...addressData, full_name: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    required
                    value={addressData.phone_number}
                    onChange={(e) => setAddressData({ ...addressData, phone_number: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address Line 1 (Flat, House no., Building)"
                  required
                  value={addressData.address_line1}
                  onChange={(e) => setAddressData({ ...addressData, address_line1: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Area, Street, Sector, Village)"
                  value={addressData.address_line2}
                  onChange={(e) => setAddressData({ ...addressData, address_line2: e.target.value })}
                />
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="City / Town"
                    required
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={addressData.postal_code}
                    onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })}
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-save-address" disabled={loading}>
                    {loading ? "Saving..." : "Save and Deliver Here"}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="btn-cancel-address"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className="checkout-section">
            <h2>
              <HiOutlineCreditCard /> 2. Payment Method
            </h2>

            <div className="payment-methods">
              <label className={`payment-method ${paymentMethod === "cod" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className="payment-method-label">
                  <span className="payment-method-title">Cash on Delivery</span>
                  <span className="payment-method-desc">Pay when your order arrives</span>
                </div>
              </label>

              <label className={`payment-method ${paymentMethod === "card" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="payment-method-label">
                  <span className="payment-method-title">Credit / Debit Card</span>
                  <span className="payment-method-desc">Secure online payment</span>
                </div>
                <FaCcVisa />
              </label>
            </div>
          </div>
        </div>

        {/* ── Right Column: Order Summary ── */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-items">
            {items.map((item) => {
              const unitPrice = Number.parseFloat(item.unit_price) || 0;
              const lineTotal = unitPrice * (item.quantity || 0);

              return (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-img">
                    {item.product?.images?.[0]?.image_url ? (
                      <img src={item.product.images[0].image_url} alt="img" />
                    ) : (
                      <HiOutlinePhotograph />
                    )}
                    <span className="checkout-item-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.product?.name}</span>
                    <span className="checkout-item-price">{formatPrice(lineTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span className="label">Items ({itemCount}):</span>
              <span className="value">{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span className="label">Delivery:</span>
              <span className="value">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <div className="summary-total">
              <span className="label">Order Total:</span>
              <span className="value">{formatPrice(total)}</span>
            </div>
          </div>

          {!selectedAddressId && !showAddressForm && addresses.length > 0 && (
            <div className="checkout-error" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
              <HiOutlineExclamationCircle /> Please select an address
            </div>
          )}

          <button
            className="place-order-btn"
            disabled={!selectedAddressId || placingOrder || showAddressForm}
            onClick={handlePlaceOrder}
          >
            {placingOrder ? (
              "Processing..."
            ) : (
              <>
                <HiOutlineCheckCircle /> Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
