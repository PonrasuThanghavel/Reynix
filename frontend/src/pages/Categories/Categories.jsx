import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryAPI } from "../../api/products";
import toast from "react-hot-toast";
import { HiOutlineTag, HiArrowRight } from "react-icons/hi2";
import "./Categories.css";

/**
 *
 */
function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data.data.categories || []);
      } catch {
        toast.error("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="categories-page">
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <h1>Shop by Category</h1>
      <p className="categories-subtitle">Discover our wide collection by browsing your favorite categories.</p>

      {categories.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            marginTop: "4rem",
          }}
        >
          <HiOutlineTag size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <h3>No categories found</h3>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link to={`/products?category_id=${cat.id}`} key={cat.id} className="category-card">
              <div className="category-img-wrap">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="category-img" loading="lazy" />
                ) : (
                  <HiOutlineTag className="category-placeholder" />
                )}
              </div>
              <div className="category-info">
                <div className="category-name">
                  {cat.name}
                  <HiArrowRight />
                </div>
                {cat.description && <p className="category-description">{cat.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Categories;
