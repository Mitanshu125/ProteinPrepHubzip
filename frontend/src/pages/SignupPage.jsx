import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function getStrength(checks) {
  const score = Object.values(checks).filter(Boolean).length;
  if (score <= 2) return { label: "Weak", level: 1, color: "#d64545" };
  if (score <= 4) return { label: "Medium", level: 2, color: "#d69b34" };
  return { label: "Strong", level: 3, color: "#2e7d4f" };
}

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const checks = getPasswordChecks(password);
  const strength = getStrength(checks);
  const isStrongEnough = checks.length && checks.lower && checks.upper && checks.number && checks.symbol;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isStrongEnough) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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
            <span className="auth-brand-logo">💪</span>
            <h2>Join ProteinPrepHub</h2>
            <p>Create your free account and start tracking macros, saving recipes, and hitting your protein goals — synced everywhere you log in.</p>
            <ul className="auth-brand-features">
              <li><span>✓</span> Save favourite recipes to your account</li>
              <li><span>✓</span> Track meals & protein goals daily</li>
              <li><span>✓</span> Build a real streak, not a guess</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create Account</h2>
            <p className="auth-form-sub">It's free and only takes a minute.</p>

            {error && <p className="auth-error">{error}</p>}

            <label>Name</label>
            <div className="input-icon-wrap">
              <span className="input-icon">👤</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

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
                placeholder="At least 8 characters"
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

            {password.length > 0 && (
              <div className="password-strength">
                <div className="strength-bar-track">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${(strength.level / 3) * 100}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>

                <ul className="strength-checklist">
                  <li className={checks.length ? "check-pass" : ""}>{checks.length ? "✓" : "•"} At least 8 characters</li>
                  <li className={checks.upper ? "check-pass" : ""}>{checks.upper ? "✓" : "•"} Uppercase letter</li>
                  <li className={checks.lower ? "check-pass" : ""}>{checks.lower ? "✓" : "•"} Lowercase letter</li>
                  <li className={checks.number ? "check-pass" : ""}>{checks.number ? "✓" : "•"} Number</li>
                  <li className={checks.symbol ? "check-pass" : ""}>{checks.symbol ? "✓" : "•"} Symbol (!@#$...)</li>
                </ul>
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;