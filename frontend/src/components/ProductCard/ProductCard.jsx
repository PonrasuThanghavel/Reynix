import { useNavigate } from "react-router-dom";
import { HiOutlineHeart, HiHeart, HiOutlineShoppingCart, HiStar, HiOutlineStar } from "react-icons/hi2";
import { HiOutlinePhotograph } from "react-icons/hi";
import { useWishlist } from "../../context/WishlistContext";
import "./ProductCard.css";

/**
 *
 * @param root0
 * @param root0.product
 */
function ProductCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const sellingPrice = Number.parseFloat(product.selling_price) || 0;
  const basePrice = Number.parseFloat(product.base_price) || 0;
  const discount = Number.parseFloat(product.discount_percent) || 0;
  const rating = Number.parseFloat(product.average_rating) || 0;
  const reviewCount = product.review_count || 0;

  const primaryImage = product.images?.[0]?.image_url;

  const renderStars = (value) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.round(value) ? <HiStar key={i} /> : <HiOutlineStar key={i} className="star-empty" />);
    }
    return stars;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)} id={`product-card-${product.id}`}>
      <div className="product-card-image">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">
            <HiOutlinePhotograph />
          </div>
        )}

        {discount > 0 && <span className="product-card-badge badge-discount">{Math.round(discount)}% OFF</span>}

        {product.is_featured && (
          <span className="product-card-badge badge-featured" style={discount > 0 ? { top: "44px" } : {}}>
            Featured
          </span>
        )}

        <button
          className="product-card-wishlist"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist(product.id) ? <HiHeart style={{ color: "#ef4444" }} /> : <HiOutlineHeart />}
        </button>
      </div>

      <div className="product-card-body">
        {product.category && <span className="product-card-category">{product.category.name}</span>}

        <h3 className="product-card-name">{product.name}</h3>

        {reviewCount > 0 && (
          <div className="product-card-rating">
            <div className="product-card-stars">{renderStars(rating)}</div>
            <span className="product-card-rating-text">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="product-card-selling-price">{formatPrice(sellingPrice)}</span>
            {basePrice > sellingPrice && <span className="product-card-base-price">{formatPrice(basePrice)}</span>}
          </div>

          <button
            className="product-card-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              // Cart logic will come later
            }}
            title="Add to cart"
          >
            <HiOutlineShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
