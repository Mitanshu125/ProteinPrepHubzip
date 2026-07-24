import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError("Could not connect to server");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-brand-panel">
          <div className="auth-brand-blob auth-blob-1" />
          <div className="auth-brand-blob auth-blob-2" />
          <div className="auth-brand-content">
            <span className="auth-brand-logo">🥗</span>
            <h2>Welcome back</h2>
            <p>Log in to pick up right where you left off — your favourites, protein goals, and meal history are all waiting.</p>
            <ul className="auth-brand-features">
              <li><span>✓</span> Your saved recipes, synced</li>
              <li><span>✓</span> Today's protein progress</li>
              <li><span>✓</span> Your streak, still going</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Welcome Back</h2>
            <p className="auth-form-sub">Log in to continue.</p>

            {error && <p className="auth-error">{error}</p>}

            <label>Email</label>
            <div className="input-icon-wrap">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <label>Password</label>
            <div className="password-field">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="has-left-icon"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;