import { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSquares2X2,
  HiOutlineBuildingStorefront,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { RiShoppingBag3Line } from "react-icons/ri";
import "./Layout.css";

/**
 *
 */
function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
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

  return (
    <div className="layout">
      <nav className="navbar" id="main-navbar">
        <Link to="/" className="navbar-brand">
          <RiShoppingBag3Line />
          Reynix
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/categories">Categories</NavLink>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/wishlist" className="navbar-icon-btn" title="Wishlist">
                <HiOutlineHeart />
              </Link>
              <Link to="/cart" className="navbar-icon-btn" title="Cart">
                <HiOutlineShoppingBag />
                {itemCount > 0 && <span className="badge">{itemCount > 9 ? "9+" : itemCount}</span>}
              </Link>

              <div className="navbar-user" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="navbar-avatar">{getInitials(user.full_name)}</div>
                <span className="navbar-user-name">{user.full_name?.split(" ")[0]}</span>

                {dropdownOpen && (
                  <div className="navbar-dropdown" id="user-dropdown">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                      <HiOutlineUser /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)}>
                      <HiOutlineClipboardDocumentList /> My Orders
                    </Link>

                    {user.role === "seller" && (
                      <Link to="/seller/dashboard" onClick={() => setDropdownOpen(false)}>
                        <HiOutlineBuildingStorefront /> Seller Dashboard
                      </Link>
                    )}

                    {user.role === "admin" && (
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>
                        <HiOutlineSquares2X2 /> Admin Panel
                      </Link>
                    )}

                    <Link to="/settings" onClick={() => setDropdownOpen(false)}>
                      <HiOutlineCog6Tooth /> Settings
                    </Link>

                    <div className="divider" />

                    <button className="logout-btn" onClick={handleLogout} id="logout-button">
                      <HiOutlineArrowRightOnRectangle /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="btn-login" id="login-nav-btn">
                Log in
              </Link>
              <Link to="/register" className="btn-signup" id="signup-nav-btn">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
