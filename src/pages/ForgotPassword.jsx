import { Link } from "react-router-dom";
import { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address");
      return;
    }
    // Logic for sending reset link will be implemented here
    setIsSent(true);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h3 style={{ margin: 0, fontSize: "22px" }}>
            <span style={{ color: "#2563eb", fontWeight: "900" }}>W</span>
            <span style={{ color: "#1e293b", fontWeight: "700" }}>Workforce</span>
          </h3>
          <h2 style={titleStyle}>Reset Password</h2>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <p style={descriptionStyle}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                required
              />
            </div>

            <button
              type="submit"
              style={submitBtnStyle}
              onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
              onMouseOut={(e) => (e.target.style.background = "#2563eb")}
            >
              Send Reset Link
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>📩</div>
            <h3 style={{ color: "#1e293b", marginBottom: "10px" }}>Check your email</h3>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6" }}>
              We've sent a password reset link to <br /> <strong>{email}</strong>
            </p>
            <button 
              onClick={() => setIsSent(false)}
              style={retryBtnStyle}
            >
              Didn't get the email? Try again
            </button>
          </div>
        )}

        <div style={footerStyle}>
          <Link
            to="/login"
            style={backLinkStyle}
            onMouseOver={(e) => (e.target.style.color = "#2563eb")}
            onMouseOut={(e) => (e.target.style.color = "#64748b")}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh", fontFamily: "'Inter', sans-serif", background: "#f8fafc", padding: "20px" };
const cardStyle = { width: "100%", maxWidth: "400px", padding: "40px", borderRadius: "16px", background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
const titleStyle = { color: "#1e293b", fontWeight: "800", marginTop: "15px", fontSize: "24px" };
const descriptionStyle = { fontSize: "14px", color: "#64748b", textAlign: "center", lineHeight: "1.5", marginBottom: "25px" };
const labelStyle = { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#475569" };
const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", boxSizing: "border-box", transition: "border-color 0.2s" };
const submitBtnStyle = { width: "100%", padding: "14px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "16px", transition: "background 0.2s" };
const retryBtnStyle = { background: "none", border: "none", color: "#2563eb", cursor: "pointer", marginTop: "20px", fontWeight: "600" };
const footerStyle = { textAlign: "center", marginTop: "25px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" };
const backLinkStyle = { color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "600", transition: "color 0.2s" };

export default ForgotPassword;