import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineSparkles } from "react-icons/hi2";
import "./Home.css";

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {user && (
        <div className="home-welcome">
          <HiOutlineSparkles />
          <p>
            Welcome back, <strong>{user.full_name}</strong>! You&apos;re logged
            in as a <strong>{user.role}</strong>.
          </p>
        </div>
      )}

      <section className="home-hero">
        <h1>Shop Smarter with Reynix</h1>
        <p>
          Discover amazing products from multiple vendors, all in one place.
          Fast delivery, secure payments, and great deals await.
        </p>
        <div className="home-hero-actions">
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
          {!user && (
            <Link to="/register" className="btn-secondary">
              Create Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
