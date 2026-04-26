import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productAPI } from "../../api/products";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineHeart,
  HiHeart,
  HiOutlineShoppingCart,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
  HiOutlineBuildingStorefront,
  HiOutlineTag,
  HiOutlineSquare3Stack3D,
  HiStar,
  HiOutlineStar,
} from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";
import "./ProductDetail.css";

/**
 *
 */
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productAPI.getProductById(id);
        const p = res.data.data.product;
        setProduct(p);
        // Auto-select first variant if available
        if (p.variants?.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product details.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="product-detail-loading">
          <div className="loading-spinner" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <Link to="/products" className="product-detail-back">
          <HiOutlineArrowLeft /> Back to Products
        </Link>
        <div className="product-detail-error">
          <HiOutlineExclamationTriangle />
          <h3>Product not found</h3>
          <p>{error || "This product doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  const sellingPrice = Number.parseFloat(product.selling_price) || 0;
  const basePrice = Number.parseFloat(product.base_price) || 0;
  const discount = Number.parseFloat(product.discount_percent) || 0;
  const rating = Number.parseFloat(product.average_rating) || 0;
  const reviewCount = product.review_count || 0;
  const images = product.images || [];
  const variants = product.variants || [];
  const inventory = product.inventory || [];

  // Calculate total stock
  const totalStock = inventory.reduce(
    (sum, inv) => sum + (inv.quantity || 0),
    0,
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const renderStars = (value) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= Math.round(value) ? (
          <HiStar key={i} />
        ) : (
          <HiOutlineStar key={i} className="star-empty" />
        ),
      );
    }
    return stars;
  };

  const getStockStatus = () => {
    if (totalStock <= 0)
      return {
        dot: "stock-out",
        text: "stock-text-out",
        label: "Out of stock",
      };
    if (totalStock <= 5)
      return {
        dot: "stock-low",
        text: "stock-text-low",
        label: `Only ${totalStock} left`,
      };
    return { dot: "stock-in", text: "stock-text-in", label: "In stock" };
  };

  const stock = getStockStatus();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addItem(product.id, selectedVariant?.id || null, quantity);
      toast.success(`Added ${quantity}x "${product.name}" to cart`);
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="product-detail">
      <Link to="/products" className="product-detail-back">
        <HiOutlineArrowLeft /> Back to Products
      </Link>

      <div className="product-detail-layout">
        {/* ── Left: Image Gallery ── */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]?.image_url}
                alt={images[selectedImage]?.alt_text || product.name}
              />
            ) : (
              <div className="product-gallery-placeholder">
                <HiOutlinePhotograph />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="product-gallery-thumbs">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className={`product-gallery-thumb ${idx === selectedImage ? "active" : ""}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || `View ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Product Info ── */}
        <div className="product-info">
          {/* Breadcrumbs */}
          <div className="product-info-breadcrumbs">
            <Link to="/products">Products</Link>
            {product.category && (
              <>
                <span className="separator">›</span>
                <Link to={`/products?category_id=${product.category.id}`}>
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="separator">›</span>
            <span>{product.name}</span>
          </div>

          {/* Title */}
          <h1>{product.name}</h1>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="product-info-rating">
              <div className="product-info-stars">{renderStars(rating)}</div>
              <span className="product-info-rating-text">
                <strong>{rating.toFixed(1)}</strong> ({reviewCount} review
                {reviewCount !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="product-price-block">
            <span className="product-selling-price">
              {formatPrice(sellingPrice)}
            </span>
            {basePrice > sellingPrice && (
              <span className="product-base-price">
                {formatPrice(basePrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="product-discount-tag">
                {Math.round(discount)}% OFF
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <div className="product-description-section">
              <p className="product-short-desc">{product.short_description}</p>
            </div>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <div className="product-variants">
              <h3>Variants</h3>
              <div className="product-variant-list">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className={`product-variant-chip ${selectedVariant?.id === v.id ? "selected" : ""}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.name || v.sku || `Variant ${v.id}`}
                    {v.price_adjustment && v.price_adjustment !== 0 && (
                      <span> (+{formatPrice(v.price_adjustment)})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="product-stock">
            <span className={`stock-dot ${stock.dot}`} />
            <span className={stock.text}>{stock.label}</span>
          </div>

          {/* Quantity */}
          {totalStock > 0 && (
            <div className="product-quantity">
              <h3>Quantity</h3>
              <div className="quantity-control">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <HiOutlineMinus />
                </button>
                <div className="quantity-value">{quantity}</div>
                <button
                  className="quantity-btn"
                  onClick={() =>
                    setQuantity((q) => Math.min(totalStock, q + 1))
                  }
                  disabled={quantity >= totalStock}
                >
                  <HiOutlinePlus />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="product-actions">
            <button
              className="product-add-cart-btn"
              disabled={totalStock <= 0 || addingToCart}
              onClick={handleAddToCart}
              id="add-to-cart-btn"
            >
              <HiOutlineShoppingCart />
              {totalStock <= 0
                ? "Out of Stock"
                : addingToCart
                  ? "Adding..."
                  : "Add to Cart"}
            </button>
            <button
              className="product-wishlist-btn"
              onClick={() => toggleWishlist(product)}
              title={
                isInWishlist(product?.id)
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              {isInWishlist(product?.id) ? (
                <HiHeart style={{ color: "#ef4444" }} />
              ) : (
                <HiOutlineHeart />
              )}
            </button>
          </div>

          {/* Full Description */}
          {product.description && (
            <div className="product-description-section">
              <h3>Description</h3>
              <p className="product-full-desc">{product.description}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="product-meta">
            {product.brand && (
              <div className="product-meta-item">
                <HiOutlineTag />
                Brand: <strong>{product.brand.name}</strong>
              </div>
            )}
            {product.category && (
              <div className="product-meta-item">
                <HiOutlineSquare3Stack3D />
                Category: <strong>{product.category.name}</strong>
              </div>
            )}
            {product.seller && (
              <div className="product-meta-item">
                <HiOutlineBuildingStorefront />
                Sold by: <strong>{product.seller.full_name}</strong>
              </div>
            )}
            {product.sku && (
              <div className="product-meta-item">
                SKU: <strong>{product.sku}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
