import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";

interface AuthPageProps {
  mode: "login" | "register";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const { data } = await api.post(endpoint, { email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(mode === "login" ? "Welcome back!" : "Account created! Welcome to EduCap 🎓");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "radial-gradient(ellipse 60% 60% at 50% 20%, rgba(108,71,255,0.12) 0%, transparent 70%)",
      }}
    >
      <div className="card animate-fadeInUp" style={{ width: "100%", maxWidth: "420px", padding: "40px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎓</div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {mode === "login"
              ? "Log in to access your saved plans"
              : "Start planning smarter — it's free"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-label="Email address"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
            id={`${mode}-submit-btn`}
          >
            {loading
              ? (mode === "login" ? "Signing in..." : "Creating account...")
              : (mode === "login" ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--primary-light)", fontWeight: 600 }}>
                Sign up free
              </Link>
            </>
          ) : (
            <>Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--primary-light)", fontWeight: 600 }}>
                Sign in
              </Link>
            </>
          )}
        </p>

        {mode === "register" && (
          <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "16px" }}>
            By creating an account, you agree that EduCap provides financial estimates for educational purposes only — not licensed financial advice.
          </p>
        )}
      </div>
    </div>
  );
}
