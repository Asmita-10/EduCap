import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";

export default function Navbar() {
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="EduCap home">
          🎓 Edu<span>Cap</span>
        </Link>

        <div className="navbar-links">
          <Link to="/wizard" className="btn btn-ghost btn-sm">
            <span className="nav-text">Calculator</span>
          </Link>

          {isAuthenticated() ? (
            <>
              <Link to="/terms" className="btn btn-ghost btn-sm">
                <span className="nav-text">Terms and Conditions</span>
              </Link>
              {user?.tier === "FREE" && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--moderate)",
                    border: "1px solid rgba(217,119,6,0.3)",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontWeight: 600,
                  }}
                >
                  FREE
                </span>
              )}
              {(user?.tier === "PLUS" || user?.tier === "PRO") && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--primary)",
                    border: "1px solid rgba(108,71,255,0.3)",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontWeight: 600,
                  }}
                >
                  {user.tier}
                </span>
              )}
              {user?.tier === "FREE" && (
                <Link to="/dashboard#pricing" className="btn btn-primary btn-sm">
                  Upgrade
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
