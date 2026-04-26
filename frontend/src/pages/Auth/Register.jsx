import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlineBuildingStorefront,
  HiOutlineTruck,
} from "react-icons/hi2";
import { HiOutlineShoppingCart } from "react-icons/hi";
import "./Auth.css";

/**
 *
 */
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { value: "customer", label: "Customer", icon: <HiOutlineShoppingCart /> },
    { value: "seller", label: "Seller", icon: <HiOutlineBuildingStorefront /> },
    { value: "shipper", label: "Shipper", icon: <HiOutlineTruck /> },
  ];

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "Name is required";
    else if (form.full_name.trim().length < 2)
      newErrors.full_name = "Name must be at least 2 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    try {
      const { full_name, email, password, role } = form;
      const user = await register({ full_name, email, password, role });
      toast.success(`Welcome to Reynix, ${user.full_name}!`);
      navigate("/");
    } catch {
      const message = "Registration failed. Please try again.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create account</h1>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        {apiError && <div className="auth-error">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <div className="form-input-wrapper">
              <HiOutlineUser className="input-icon" />
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                value={form.full_name}
                onChange={handleChange}
                className={errors.full_name ? "input-error" : ""}
                autoComplete="name"
              />
            </div>
            {errors.full_name && (
              <span className="field-error">{errors.full_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="form-input-wrapper">
              <HiOutlineEnvelope className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="form-input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="form-input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label>I want to</label>
            <div className="role-selector">
              {roles.map((r) => (
                <div
                  key={r.value}
                  className={`role-option ${form.role === r.value ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, role: r.value })}
                >
                  {r.icon} {r.label}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading && <span className="spinner" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
