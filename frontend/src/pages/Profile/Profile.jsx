import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { profileAPI } from "../../api/wishlist";
import { addressAPI } from "../../api/orders";
import toast from "react-hot-toast";
import {
  HiOutlineMapPin,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import "./Profile.css";

function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
  });
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setFormData({
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      gender: user.gender || "",
      date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : "",
    });
    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      const res = await addressAPI.getAddresses();
      setAddresses(res.data.data.addresses || []);
    } catch {
      /* ignore */
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileAPI.updateProfile(formData);
      const updated = res.data.data.user;

      // Update AuthContext so the navbar reflects the new name
      if (setUser) {
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }

      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addressAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!user) return null;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {/* ── Profile Card ── */}
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{getInitials(user.full_name)}</div>
          <div className="profile-top-info">
            <h2>
              {user.full_name}
              <span className="profile-role-badge">{user.role}</span>
            </h2>
            <p>{user.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-form-row">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="profile-field">
              <label>Email (cannot change)</label>
              <input type="email" value={user.email} disabled />
            </div>
          </div>

          <div className="profile-form-row">
            <div className="profile-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="profile-form-row">
            <div className="profile-field">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="profile-save-btn" disabled={saving}>
            <HiOutlineCheckCircle />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="profile-meta" style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
          <div className="profile-meta-item">
            <span className="profile-meta-label">Member Since</span>
            <span className="profile-meta-value">{formatDate(user.created_at)}</span>
          </div>
          {user.last_login_at && (
            <div className="profile-meta-item">
              <span className="profile-meta-label">Last Login</span>
              <span className="profile-meta-value">{formatDate(user.last_login_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Addresses ── */}
      <div className="profile-section">
        <h2><HiOutlineMapPin /> Saved Addresses</h2>

        {addresses.length === 0 ? (
          <p className="profile-no-addresses">No saved addresses yet. You can add one during checkout.</p>
        ) : (
          <div className="profile-addresses">
            {addresses.map((addr) => (
              <div className="profile-address-card" key={addr.id}>
                {addr.is_default && <div className="profile-address-label">Default</div>}
                <div className="profile-address-name">{addr.full_name}</div>
                <div className="profile-address-text">
                  {addr.address_line1}
                  {addr.address_line2 && <>, {addr.address_line2}</>}
                  <br />
                  {addr.city}, {addr.state} {addr.postal_code}
                </div>
                <div className="profile-address-phone">{addr.phone_number}</div>
                <button
                  className="profile-address-delete"
                  onClick={() => handleDeleteAddress(addr.id)}
                  title="Delete address"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
