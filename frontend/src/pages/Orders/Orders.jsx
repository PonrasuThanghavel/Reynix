import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { orderAPI } from "../../api/orders";
import toast from "react-hot-toast";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";
import "./Orders.css";

/**
 *
 */
function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrders();
      setOrders(res.data.data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [user, navigate]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <h1>Your Orders</h1>
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <h1>Your Orders</h1>
        <div className="orders-empty">
          <HiOutlineShoppingBag />
          <h3>No orders yet</h3>
          <p>Looks like you haven't placed any orders yet.</p>
          <Link to="/products">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>

      <div className="orders-container">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <div className="order-meta">
                <div className="order-meta-item">
                  <span className="order-meta-label">Order Placed</span>
                  <span className="order-meta-value">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-meta-item">
                  <span className="order-meta-label">Total Amount</span>
                  <span className="order-meta-value">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="order-meta-item">
                  <span className="order-meta-label">Order #</span>
                  <span className="order-meta-value">{order.order_number}</span>
                </div>
              </div>

              <div className="order-header-right">
                <span className={`status-badge ${order.status}`}>{order.status}</span>
                <Link to={`/orders/${order.id}`} className="order-view-details">
                  View Details
                </Link>
              </div>
            </div>

            <div className="order-body">
              {order.items?.map((item) => (
                <div className="order-item" key={item.id}>
                  <div className="order-item-img">
                    {/* The API fetches product associated with order items. 
                        In order list, we usually don't fetch all images to save bandwidth,
                        so we use placeholder if images aren't eagerly loaded on index by default */}
                    {item.product?.images?.[0]?.image_url ? (
                      <img
                        src={item.product.images[0].image_url}
                        alt={item.product_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <HiOutlinePhotograph />
                    )}
                  </div>
                  <div className="order-item-info">
                    <Link to={`/products/${item.product_id}`} className="order-item-name">
                      {item.product_name}
                    </Link>
                    {item.variant_name && <div className="order-item-variant">Variant: {item.variant_name}</div>}
                  </div>
                  <div className="order-item-price">
                    {item.quantity} x {formatPrice(item.unit_price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
