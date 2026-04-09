import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // रिडायरेक्शन हेल्पर: जर युजर बुक करताना लॉगिनला आला असेल तर तिथेच परत पाठवण्यासाठी
  const getDestination = (defaultPath) => {
    return location.state?.from || defaultPath;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setErrorMessage("");

    const identifier = formData.identifier.trim();
    const password = formData.password.trim();

    if (!identifier || !password) {
      setErrorMessage("Please enter both phone and password!");
      setLoading(false);
      return;
    }

    // --- ADMIN LOGIN OVERRIDE ---
    if (identifier === "admin@workforce.com" && password === "admin123") {
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userRole", "admin");
      localStorage.setItem("userName", "System Admin");
      alert("Admin Access Granted! 🛡️");
      navigate("/admin", { replace: true });
      setLoading(false);
      return;
    }

    try {
      // ✅ बॅकएंडला 'phone' या नावाने डेटा पाठवणे (401 फिक्स करण्यासाठी)
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: identifier,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const user = result.user;

        // ✅ डेटा स्टोरेज - हे केल्यावर प्रोफाइल ब्लँक दिसणार नाही
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", user.role.toLowerCase());
        sessionStorage.setItem("userPhone", user.phone); 
        
        // LocalStorage मध्ये नाव सेव्ह करणे (Header/Profile साठी)
        localStorage.setItem("userName", user.full_name || "User");
        localStorage.setItem("userExp", user.experience_years || "0");
        localStorage.setItem("userTrade", user.trade || "");

        const role = user.role.toLowerCase();
        alert(`Welcome, ${user.full_name}! 👋`);

        // 🚀 स्मार्ट रिडायरेक्शन
        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (role === "specialist") {
          navigate("/profile", { replace: true });
        } else {
          const destination = getDestination("/workers");
          navigate(destination, { replace: true });
        }
        
      } else {
        // जर 401 एरर आला तर बॅकएंडचा एरर मेसेज दाखवा
        setErrorMessage(result.error || "Invalid login credentials!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Server not responding. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper" style={containerStyle}>
      <div className="auth-card" style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={logoWrapper}>
              <span style={{ color: "#2563eb", fontWeight: "900" }}>W</span>
              <span style={{ color: "#1e293b", fontWeight: "700" }}>orkforce</span>
          </div>
          <h2 style={{ marginTop: "10px", color: "#1e293b", fontSize: "22px" }}>Welcome Back</h2>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Sign in to your account</p>
        </div>

        {errorMessage && <div style={errorAlertStyle}>{errorMessage}</div>}

        <form onSubmit={handleLogin}>
          <div style={inputGroup}>
            <label style={labelStyle}>Phone Number</label>
            <input 
              type="text" 
              placeholder="Enter your phone number" 
              style={inputStyle}
              value={formData.identifier}
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              autoFocus
              required
            />
          </div>

          <div style={inputGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={labelStyle}>Password</label>
              <Link to="/forgot-password" style={forgotLinkStyle}>Forgot?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={inputStyle}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
                ...btnStyle, 
                background: isHovered ? "#1d4ed8" : "#2563eb",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div style={footerSection}>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            New here? <Link to="/register" style={registerLinkStyle}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Styles (Same as your UI) ---
const errorAlertStyle = { backgroundColor: "#fef2f2", color: "#dc2626", padding: "12px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px", border: "1px solid #fee2e2", textAlign: "center", fontWeight: "600" };
const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f1f5f9", padding: "20px", fontFamily: "'Inter', sans-serif" };
const cardStyle = { width: "100%", maxWidth: "400px", padding: "40px", background: "#ffffff", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" };
const logoWrapper = { fontSize: "28px", letterSpacing: "-1.5px" };
const inputGroup = { marginBottom: "24px" };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" };
const inputStyle = { width: "100%", padding: "14px", border: "1.5px solid #e2e8f0", borderRadius: "12px", boxSizing: "border-box", outline: "none", fontSize: "15px" };
const btnStyle = { width: "100%", padding: "14px", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", transition: "0.3s", marginTop: "10px" };
const forgotLinkStyle = { fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: "600" };
const registerLinkStyle = { color: "#2563eb", fontWeight: "800", textDecoration: "none" };
const footerSection = { marginTop: "30px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "20px" };

export default Login;