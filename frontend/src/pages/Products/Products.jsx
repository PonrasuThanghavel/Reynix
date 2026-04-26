import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI, categoryAPI, brandAPI } from "../../api/products";
import ProductCard from "../../components/ProductCard/ProductCard";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { HiOutlineShoppingBag } from "react-icons/hi";
import "./Products.css";

/**
 *
 */
function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read filters from URL
  const filters = {
    search: searchParams.get("search") || "",
    category_id: searchParams.get("category_id") || "",
    brand_id: searchParams.get("brand_id") || "",
    sort: searchParams.get("sort") || "",
    page: Number.parseInt(searchParams.get("page"), 10) || 1,
  };

  const updateFilter = useCallback(
    (key, value) => {
      setSearchParams((prevParams) => {
        const newParams = new URLSearchParams(prevParams);
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
        if (key !== "page") {
          newParams.delete("page");
        }
        return newParams;
      });
    },
    [setSearchParams],
  );

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    filters.search || filters.category_id || filters.brand_id || filters.sort;

  // Fetch categories and brands once
  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((res) => {
        const cats = res.data.data.categories || [];
        // Flatten nested categories
        const flat = [];
        cats.forEach((cat) => {
          flat.push(cat);
          if (cat.children) flat.push(...cat.children);
        });
        setCategories(flat);
      })
      .catch(() => {});

    brandAPI
      .getBrands()
      .then((res) => setBrands(res.data.data.brands || []))
      .catch(() => {});
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.brand_id) params.brand_id = filters.brand_id;
      if (filters.sort) params.sort = filters.sort;
      if (filters.page > 1) params.page = filters.page;

      const res = await productAPI.getProducts(params);
      setProducts(res.data.data.products || []);
      setPagination(res.data.data.pagination || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load products. Is the backend running?",
      );
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.category_id,
    filters.brand_id,
    filters.sort,
    filters.page,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilter("search", searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, updateFilter]);

  // Sync searchInput when URL changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(filters.search);
  }, [filters.search]);

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages, total } = pagination;
    const pages = [];

    // Determine visible pages
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="products-pagination">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => updateFilter("page", String(page - 1))}
        >
          <HiOutlineChevronLeft />
        </button>

        {start > 1 && (
          <>
            <button
              className="pagination-btn"
              onClick={() => updateFilter("page", "1")}
            >
              1
            </button>
            {start > 2 && <span className="pagination-info">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn ${p === page ? "active" : ""}`}
            onClick={() => updateFilter("page", String(p))}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="pagination-info">…</span>}
            <button
              className="pagination-btn"
              onClick={() => updateFilter("page", String(totalPages))}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => updateFilter("page", String(page + 1))}
        >
          <HiOutlineChevronRight />
        </button>

        <span className="pagination-info">
          {total} product{total !== 1 ? "s" : ""}
        </span>
      </div>
    );
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>
          Products
          {pagination && (
            <span className="products-count">({pagination.total})</span>
          )}
        </h1>
      </div>

      {/* ── Toolbar ── */}
      <div className="products-toolbar">
        <div className="search-box">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="product-search-input"
          />
        </div>

        <select
          className="filter-select"
          value={filters.category_id}
          onChange={(e) => updateFilter("category_id", e.target.value)}
          id="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.brand_id}
          onChange={(e) => updateFilter("brand_id", e.target.value)}
          id="brand-filter"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          id="sort-filter"
        >
          <option value="">Newest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="name">Name A→Z</option>
        </select>

        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            <HiOutlineXMark /> Clear
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="products-error">
          <HiOutlineExclamationTriangle />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchProducts}>
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <HiOutlineShoppingBag />
          <h3>No products found</h3>
          <p>
            {hasActiveFilters
              ? "Try adjusting your filters or search term."
              : "No products available yet. Check back later!"}
          </p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default Products;
