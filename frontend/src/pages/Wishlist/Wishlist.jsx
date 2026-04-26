import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { wishlistAPI } from "../../api/wishlist";
import toast from "react-hot-toast";
import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineTrash,
} from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";
import "./Wishlist.css";

function Wishlist() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getWishlist();
      setItems(res.data.data.items || []);
    } catch {
      toast.error("Failed to load wishlist");
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
    fetchWishlist();
  }, [user, navigate]);

  const handleRemove = async (id) => {
    try {
      await wishlistAPI.removeFromWishlist(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await addItem(item.product_id, item.variant_id || null, 1);
      toast.success(`Added "${item.product?.name}" to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="wishlist-page">
        <h1>Wishlist</h1>
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wishlist-page">
        <h1>Wishlist</h1>
        <div className="wishlist-empty">
          <HiOutlineHeart />
          <h3>Your wishlist is empty</h3>
          <p>Save items you love for later!</p>
          <Link to="/products">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1>Wishlist ({items.length})</h1>

      <div className="wishlist-items">
        {items.map((item) => {
          const sellingPrice = Number(item.product?.selling_price || 0);
          const basePrice = Number(item.product?.base_price || 0);

          return (
            <div className="wishlist-item" key={item.id}>
              <Link to={`/products/${item.product_id}`} className="wishlist-item-image">
                {item.product?.images?.[0]?.image_url ? (
                  <img src={item.product.images[0].image_url} alt={item.product?.name} />
                ) : (
                  <HiOutlinePhotograph />
                )}
              </Link>

              <div className="wishlist-item-info">
                <Link to={`/products/${item.product_id}`} className="wishlist-item-name">
                  {item.product?.name || "Product"}
                </Link>
                {item.variant && (
                  <div className="wishlist-item-variant">{item.variant.variant_name}</div>
                )}
                <div className="wishlist-item-price">
                  {formatPrice(sellingPrice)}
                  {basePrice > sellingPrice && (
                    <span className="wishlist-item-base-price">{formatPrice(basePrice)}</span>
                  )}
                </div>
              </div>

              <div className="wishlist-item-actions">
                <button className="wishlist-add-cart-btn" onClick={() => handleAddToCart(item)}>
                  <HiOutlineShoppingCart /> Add to Cart
                </button>
                <button className="wishlist-remove-btn" onClick={() => handleRemove(item.id)}>
                  <HiOutlineTrash /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;
