import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      // Backend always returns a generic success message regardless of
      // whether the email exists, so we just show the confirmation state.
      setSubmitted(true);
      setLoading(false);
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
            <span className="auth-brand-logo">🔑</span>
            <h2>Forgot your password?</h2>
            <p>No problem. Enter the email on your account and we'll send you a link to set a new one.</p>
            <ul className="auth-brand-features">
              <li><span>✓</span> Link expires in 30 minutes</li>
              <li><span>✓</span> Your data stays exactly as you left it</li>
            </ul>
          </div>
        </div>

        <div className="auth-form-panel">
          {submitted ? (
            <div className="auth-form">
              <h2>Check your inbox</h2>
              <p className="auth-form-sub">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. It'll expire in 30 minutes.
              </p>
              <p className="auth-switch">
                <Link to="/login">Back to login</Link>
              </p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <h2>Reset Password</h2>
              <p className="auth-form-sub">Enter your email and we'll send you a reset link.</p>

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

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="auth-switch">
                Remembered it? <Link to="/login">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;