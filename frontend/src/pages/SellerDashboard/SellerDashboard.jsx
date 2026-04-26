import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sellerAPI } from "../../api/seller";
import { categoryAPI, brandAPI } from "../../api/products";
import toast from "react-hot-toast";
import {
  HiOutlineCube,
  HiOutlineClipboardDocumentList,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArchiveBox,
  HiOutlineTruck,
  HiOutlineCurrencyRupee,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import "./SellerDashboard.css";

const emptyProduct = {
  name: "",
  description: "",
  short_description: "",
  category_id: "",
  brand_id: "",
  base_price: "",
  selling_price: "",
  discount_percent: "",
  sku: "",
  status: "active",
  initial_stock: "10",
};

function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);

  // Action loading
  const [actionId, setActionId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, catRes, brandRes] = await Promise.allSettled([
        sellerAPI.getMyProducts({ seller_id: user?.id, limit: 100 }),
        sellerAPI.getOrders(),
        categoryAPI.getCategories(),
        brandAPI.getBrands(),
      ]);

      if (prodRes.status === "fulfilled") setProducts(prodRes.value.data.data.products || []);
      if (orderRes.status === "fulfilled") setOrders(orderRes.value.data.data.sellerOrders || []);
      if (catRes.status === "fulfilled") setCategories(catRes.value.data.data.categories || []);
      if (brandRes.status === "fulfilled") setBrands(brandRes.value.data.data.brands || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "seller") {
      navigate("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [user, navigate, loadData]);

  // ── Product CRUD ──
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ ...emptyProduct });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      short_description: product.short_description || "",
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      base_price: product.base_price || "",
      selling_price: product.selling_price || "",
      discount_percent: product.discount_percent || "",
      sku: product.sku || "",
      status: product.status || "active",
      initial_stock: "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        brand_id: formData.brand_id ? Number(formData.brand_id) : null,
        base_price: Number(formData.base_price),
        selling_price: Number(formData.selling_price),
        discount_percent: formData.discount_percent ? Number(formData.discount_percent) : 0,
        initial_stock: formData.initial_stock ? Number(formData.initial_stock) : undefined,
      };

      if (editingProduct) {
        await sellerAPI.updateProduct(editingProduct.id, payload);
        toast.success("Product updated");
      } else {
        await sellerAPI.createProduct(payload);
        toast.success("Product created");
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await sellerAPI.deleteProduct(product.id);
      toast.success("Product deleted");
      loadData();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  // ── Order Actions ──
  const handlePack = async (orderId) => {
    setActionId(orderId);
    try {
      await sellerAPI.packOrder(orderId);
      toast.success("Order marked as packed");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pack order");
    } finally {
      setActionId(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  // ── Stats ──
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.items?.reduce((s, i) => s + Number(i.total_price || 0), 0) || 0),
    0
  );

  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      {/* ── Header ── */}
      <div className="seller-header">
        <h1>Seller Dashboard</h1>
        <p>Welcome back, {user.full_name}. Manage your products and orders.</p>
      </div>

      {/* ── Stats ── */}
      <div className="seller-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <HiOutlineCube />
          </div>
          <div className="stat-info">
            <h3>{totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <HiOutlineCube />
          </div>
          <div className="stat-info">
            <h3>{activeProducts}</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <HiOutlineClipboardDocumentList />
          </div>
          <div className="stat-info">
            <h3>{pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <HiOutlineCurrencyRupee />
          </div>
          <div className="stat-info">
            <h3>{formatPrice(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="seller-tabs">
        <button
          className={`seller-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <HiOutlineCube style={{ marginRight: 6, verticalAlign: "middle" }} /> Products
        </button>
        <button
          className={`seller-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <HiOutlineClipboardDocumentList style={{ marginRight: 6, verticalAlign: "middle" }} /> Orders
        </button>
      </div>

      {/* ── Products Tab ── */}
      {activeTab === "products" && (
        <>
          <div className="seller-toolbar">
            <h2>
              {totalProducts} Product{totalProducts !== 1 ? "s" : ""}
            </h2>
            <button className="btn-add-product" onClick={openCreateModal}>
              <HiOutlinePlus /> Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="seller-empty">
              <HiOutlineCube />
              <p>No products yet. Click "Add Product" to create your first listing.</p>
            </div>
          ) : (
            <div className="seller-table-wrap">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product-name">{p.name}</div>
                      </td>
                      <td>{p.category?.name || "—"}</td>
                      <td>{formatPrice(p.selling_price)}</td>
                      <td>
                        <span className={`table-status ${p.status}`}>{p.status}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action-btn" title="Edit" onClick={() => openEditModal(p)}>
                            <HiOutlinePencilSquare />
                          </button>
                          <button className="table-action-btn danger" title="Delete" onClick={() => handleDelete(p)}>
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Orders Tab ── */}
      {activeTab === "orders" && (
        <>
          <div className="seller-toolbar">
            <h2>
              {orders.length} Order{orders.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="seller-empty">
              <HiOutlineClipboardDocumentList />
              <p>No orders received yet.</p>
            </div>
          ) : (
            <div className="seller-orders">
              {orders.map((so) => (
                <div className="seller-order-card" key={so.id}>
                  <div className="seller-order-top">
                    <div>
                      <span className="seller-order-id">Order #{so.order?.order_number || so.id}</span>
                      <span className="seller-order-date" style={{ marginLeft: 12 }}>
                        {formatDate(so.created_at)}
                      </span>
                    </div>
                    <span className={`status-badge ${so.status}`}>{so.status}</span>
                  </div>

                  <div className="seller-order-items">
                    {so.items?.map((item) => (
                      <div className="seller-order-item" key={item.id}>
                        <span className="seller-order-item-name">
                          {item.product_name}
                          {item.variant_name && ` (${item.variant_name})`}
                        </span>
                        <span className="seller-order-item-qty">
                          {item.quantity} × {formatPrice(item.unit_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="seller-order-bottom">
                    <div className="seller-order-address">
                      {so.order?.shippingAddress && (
                        <>
                          Ship to: {so.order.shippingAddress.full_name}, {so.order.shippingAddress.city},{" "}
                          {so.order.shippingAddress.state} {so.order.shippingAddress.postal_code}
                        </>
                      )}
                    </div>

                    <div className="seller-order-actions">
                      {so.status === "pending" && (
                        <button className="btn-pack" onClick={() => handlePack(so.id)} disabled={actionId === so.id}>
                          <HiOutlineArchiveBox style={{ marginRight: 4, verticalAlign: "middle" }} />
                          {actionId === so.id ? "Packing..." : "Mark as Packed"}
                        </button>
                      )}
                      {so.status === "packed" && (
                        <span className="btn-ship" style={{ opacity: 0.7, cursor: "default" }}>
                          <HiOutlineTruck style={{ marginRight: 4, verticalAlign: "middle" }} />
                          Awaiting Shipper
                        </span>
                      )}
                      {["assigned", "shipped", "delivered"].includes(so.status) && (
                        <span className={`status-badge ${so.status}`}>{so.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Product Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
            <form className="modal-form" onSubmit={handleSave}>
              <label>
                Product Name *
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label>
                Short Description
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </label>

              <label>
                Description
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </label>

              <div className="modal-row">
                <label>
                  Category *
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Brand
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  >
                    <option value="">No brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="modal-row">
                <label>
                  Base Price (₹) *
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  />
                </label>
                <label>
                  Selling Price (₹) *
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  />
                </label>
              </div>

              <div className="modal-row">
                <label>
                  Discount %
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  />
                </label>
                <label>
                  SKU
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </label>
              </div>

              <div className="modal-row">
                <label>
                  Status
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                {!editingProduct && (
                  <label>
                    Initial Stock
                    <input
                      type="number"
                      min="0"
                      value={formData.initial_stock}
                      onChange={(e) => setFormData({ ...formData, initial_stock: e.target.value })}
                    />
                  </label>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-save" disabled={saving}>
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
