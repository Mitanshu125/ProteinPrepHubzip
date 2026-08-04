import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-reset-token/${token}`)
      .then((res) => res.json())
      .then((data) => setValidToken(!!data.valid))
      .catch(() => setValidToken(false))
      .finally(() => setChecking(false));
  }, [token]);
  
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate("/login"), 2000);
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
            <span className="auth-brand-logo">🔒</span>
            <h2>Set a new password</h2>
            <p>Choose a strong password you haven't used before. You'll be logged in with this one going forward.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          {checking ? (
            <div className="auth-form">
              <h2>Checking link...</h2>
              <p className="auth-form-sub">One moment.</p>
            </div>
          ) : !validToken ? (
            <div className="auth-form reset-expired-panel">
              <div className="reset-expired-icon">⚠️</div>
              <h2>Link Expired</h2>
              <p className="auth-error auth-error-block">
                This password reset link is invalid or has expired. Reset links are only valid for 30 minutes.
              </p>
              <Link to="/account-recovery" className="auth-submit-btn reset-expired-btn">
                Request a New Link
              </Link>
            </div>
          ) : success ? (
            <div className="auth-form">
              <h2>Password updated</h2>
              <p className="auth-form-sub">Redirecting you to login...</p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <h2>Reset Password</h2>
              <p className="auth-form-sub">Enter a new password for your account.</p>

              {error && <p className="auth-error">{error}</p>}

              <label>New Password</label>
              <div className="password-field">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

              <label>Confirm Password</label>
              <div className="password-field">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="has-left-icon"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? "Updating..." : "Update Password"}
              </button>

              <p className="auth-switch">
                <Link to="/login">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;