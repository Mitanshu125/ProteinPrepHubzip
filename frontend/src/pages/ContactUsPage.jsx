import axios from "axios";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send/mail`,
        { name, email, message },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 18px",
    border: `1.5px solid ${focused === field ? "var(--gold)" : "var(--border-mid)"}`,
    borderRadius: "var(--radius-sm)",
    fontSize: "15px",
    fontFamily: "Inter, sans-serif",
    background: focused === field ? "var(--white)" : "var(--cream)",
    color: "var(--navy)",
    outline: "none",
    transition: "border-color 0.22s, background 0.22s, box-shadow 0.22s",
    boxShadow: focused === field ? "0 0 0 3px var(--gold-glow)" : "none",
    resize: "vertical",
  });

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "64px 24px 100px",
      background: "var(--cream)",
      minHeight: "80vh",
    }}>
      <div style={{
        background: "var(--white)",
        borderRadius: "20px",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--shadow-card)",
        padding: "52px 56px",
        width: "100%",
        maxWidth: "660px",
      }}>

        {/* Heading */}
        <h2 style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: "44px",
          fontWeight: "600",
          color: "var(--navy)",
          marginBottom: "12px",
          lineHeight: "1.1",
          letterSpacing: "-0.3px",
        }}>
          Get in Touch
        </h2>

        <p style={{
          fontSize: "15px",
          color: "var(--text-secondary)",
          marginBottom: "40px",
          lineHeight: "1.75",
          fontWeight: "300",
          maxWidth: "480px",
        }}>
          Have questions, suggestions, or feedback about ProteinPrepHub? We'd love to hear from you. Our team typically responds within 24 hours.
        </p>

        {/* Success message */}
        {submitted && (
          <div style={{
            background: "rgba(58,122,74,0.08)",
            border: "1px solid rgba(58,122,74,0.25)",
            color: "#3a7a4a",
            borderRadius: "var(--radius-sm)",
            padding: "14px 20px",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "32px",
          }}>
            ✅ Message sent! We'll get back to you soon.
          </div>
        )}

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px", marginBottom: "36px" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "Inter, sans-serif",
            }}>
              👤 Full Name
            </label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              style={inputStyle("name")}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "Inter, sans-serif",
            }}>
              ✉️ Email Address
            </label>
            <input
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              style={inputStyle("email")}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "Inter, sans-serif",
            }}>
              💬 Message
            </label>
            <textarea
              placeholder="How can we help you?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              rows={6}
              style={{ ...inputStyle("message"), minHeight: "150px" }}
              required
            />
          </div>

          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (name && email && message && !loading) handleSubmit(e);
              }}
              disabled={loading}
              style={{
                padding: "13px 32px",
                background: "var(--navy)",
                color: "var(--gold)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "11px",
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                transition: "background 0.22s, transform 0.18s",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseOver={(e) => { if (!loading) { e.currentTarget.style.background = "var(--navy-mid)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
              onMouseOut={(e) => { e.currentTarget.style.background = "var(--navy)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading && <ClipLoader size={14} color="#c8893a" style={{ marginRight: 8 }} />}
              Send Message
            </button>
          </div>
        </div>

        {/* Divider + email link */}
        <div style={{
          borderTop: "1px solid var(--border-soft)",
          paddingTop: "24px",
        }}>
          <p style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            fontWeight: "300",
            fontFamily: "Inter, sans-serif",
          }}>
            You can also reach us at:{" "}
            <a
              href="mailto:hello@proteinprephub.com"
              style={{
                color: "var(--gold-dark)",
                fontWeight: "500",
                textDecoration: "none",
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              hello@proteinprephub.com
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default ContactUsPage;