import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../api/admin";
import toast from "react-hot-toast";
import {
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineClipboardDocumentList,
  HiOutlineTag,
  HiOutlineBuildingStorefront,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCurrencyRupee,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import "./AdminDashboard.css";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inline forms
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");

  // Order filter
  const [orderFilter, setOrderFilter] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, orderRes, prodRes, catRes, brandRes] = await Promise.allSettled([
        adminAPI.getUsers({ limit: 200 }),
        adminAPI.getOrders({ limit: 100 }),
        adminAPI.getProducts({ limit: 200 }),
        adminAPI.getCategories(),
        adminAPI.getBrands(),
      ]);

      if (userRes.status === "fulfilled") setUsers(userRes.value.data.data.users || []);
      if (orderRes.status === "fulfilled") setOrders(orderRes.value.data.data.orders || []);
      if (prodRes.status === "fulfilled") setProducts(prodRes.value.data.data.products || []);
      if (catRes.status === "fulfilled") setCategories(catRes.value.data.data.categories || []);
      if (brandRes.status === "fulfilled") setBrands(brandRes.value.data.data.brands || []);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Helpers ──
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  // ── Stats ──
  const totalUsers = users.length;
  const totalSellers = users.filter((u) => u.role === "seller").length;
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  // ── Order Actions ──
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to "${newStatus}"`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── Category CRUD ──
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await adminAPI.createCategory({ name: newCategoryName.trim() });
      toast.success("Category created");
      setNewCategoryName("");
      const res = await adminAPI.getCategories();
      setCategories(res.data.data.categories || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  // ── Brand CRUD ──
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      await adminAPI.createBrand({ name: newBrandName.trim() });
      toast.success("Brand created");
      setNewBrandName("");
      const res = await adminAPI.getBrands();
      setBrands(res.data.data.brands || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create brand");
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Delete this brand?")) return;
    try {
      await adminAPI.deleteBrand(id);
      toast.success("Brand deleted");
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete brand");
    }
  };

  // ── Product Delete ──
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await adminAPI.deleteProduct(product.id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      toast.error("Failed to delete product");
    }
  };

  // Filtered orders
  const filteredOrders = orderFilter ? orders.filter((o) => o.status === orderFilter) : orders;

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* ── Header ── */}
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Platform overview and management tools.</p>
      </div>

      {/* ── Stats ── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><HiOutlineUsers /></div>
          <div className="admin-stat-info"><h3>{totalUsers}</h3><p>Total Users</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><HiOutlineBuildingStorefront /></div>
          <div className="admin-stat-info"><h3>{totalSellers}</h3><p>Sellers</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple"><HiOutlineCube /></div>
          <div className="admin-stat-info"><h3>{totalProducts}</h3><p>Products</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon yellow"><HiOutlineClipboardDocumentList /></div>
          <div className="admin-stat-info"><h3>{totalOrders}</h3><p>Total Orders</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon red"><HiOutlineExclamationTriangle /></div>
          <div className="admin-stat-info"><h3>{pendingOrders}</h3><p>Pending</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon cyan"><HiOutlineCurrencyRupee /></div>
          <div className="admin-stat-info"><h3>{formatPrice(totalRevenue)}</h3><p>Revenue</p></div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="admin-tabs">
        {[
          { key: "overview", label: "Users", icon: <HiOutlineUsers /> },
          { key: "orders", label: "Orders", icon: <HiOutlineClipboardDocumentList /> },
          { key: "products", label: "Products", icon: <HiOutlineCube /> },
          { key: "categories", label: "Categories", icon: <HiOutlineTag /> },
          { key: "brands", label: "Brands", icon: <HiOutlineBuildingStorefront /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══════ USERS TAB ══════ */}
      {activeTab === "overview" && (
        <>
          <div className="admin-toolbar">
            <h2>{totalUsers} Registered Users</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td>
                      <span className={`user-active-dot ${u.is_active ? "active" : "inactive"}`} />{" "}
                      {u.is_active ? "Active" : "Inactive"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════ ORDERS TAB ══════ */}
      {activeTab === "orders" && (
        <>
          <div className="admin-toolbar">
            <h2>{filteredOrders.length} Order{filteredOrders.length !== 1 ? "s" : ""}</h2>
            <div className="admin-toolbar-actions">
              <select className="admin-filter-select" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="admin-empty"><HiOutlineClipboardDocumentList /><p>No orders found.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{formatDate(o.created_at)}</td>
                      <td>{o.items?.length || 0}</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(o.total_amount)}</td>
                      <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                      <td>
                        <select
                          className="status-select"
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════ PRODUCTS TAB ══════ */}
      {activeTab === "products" && (
        <>
          <div className="admin-toolbar">
            <h2>{totalProducts} Product{totalProducts !== 1 ? "s" : ""}</h2>
          </div>

          {products.length === 0 ? (
            <div className="admin-empty"><HiOutlineCube /><p>No products found.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Seller</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{p.seller?.full_name || "—"}</td>
                      <td>{p.category?.name || "—"}</td>
                      <td>{formatPrice(p.selling_price)}</td>
                      <td><span className={`table-status ${p.status}`}>{p.status}</span></td>
                      <td>
                        <button className="table-action-btn danger" title="Delete" onClick={() => handleDeleteProduct(p)}>
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════ CATEGORIES TAB ══════ */}
      {activeTab === "categories" && (
        <>
          <div className="admin-toolbar">
            <h2>{categories.length} Categor{categories.length !== 1 ? "ies" : "y"}</h2>
          </div>

          <form className="admin-inline-form" onSubmit={handleAddCategory}>
            <input
              type="text"
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <button type="submit"><HiOutlinePlus style={{ verticalAlign: "middle", marginRight: 4 }} /> Add</button>
          </form>

          {categories.length === 0 ? (
            <div className="admin-empty"><HiOutlineTag /><p>No categories yet.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td style={{ color: "var(--text-muted)" }}>{c.id}</td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{c.slug || "—"}</td>
                      <td>
                        <button className="table-action-btn danger" title="Delete" onClick={() => handleDeleteCategory(c.id)}>
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════ BRANDS TAB ══════ */}
      {activeTab === "brands" && (
        <>
          <div className="admin-toolbar">
            <h2>{brands.length} Brand{brands.length !== 1 ? "s" : ""}</h2>
          </div>

          <form className="admin-inline-form" onSubmit={handleAddBrand}>
            <input
              type="text"
              placeholder="New brand name..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              required
            />
            <button type="submit"><HiOutlinePlus style={{ verticalAlign: "middle", marginRight: 4 }} /> Add</button>
          </form>

          {brands.length === 0 ? (
            <div className="admin-empty"><HiOutlineBuildingStorefront /><p>No brands yet.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <tr key={b.id}>
                      <td style={{ color: "var(--text-muted)" }}>{b.id}</td>
                      <td style={{ fontWeight: 500 }}>{b.name}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{b.slug || "—"}</td>
                      <td>
                        <button className="table-action-btn danger" title="Delete" onClick={() => handleDeleteBrand(b.id)}>
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
