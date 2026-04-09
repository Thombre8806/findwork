import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "client",
    trade: "", // नवीन फील्ड: कामगाराच्या कामासाठी
    password: "",
    confirmPassword: "",
    address: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. बेसिक व्हॅलिडेशन (पासवर्ड मॅचिंग)
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match! ❌");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters! ⚠️");
      return;
    }

    try {
      // 2. बॅकएंड API ला डेटा पाठवणे
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          role: formData.role,
          // जर 'specialist' निवडलं असेल तरच trade पाठवा
          trade: formData.role === "specialist" ? formData.trade : null,
          password: formData.password.trim(),
          address: formData.address.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 3. सेशन्स आणि लोकल स्टोरेजमध्ये डेटा सेव्ह करणे
        sessionStorage.setItem("userRole", formData.role);
        sessionStorage.setItem("userPhone", formData.phone.trim());
        sessionStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", formData.name.trim());

        alert(`Registered Successfully as ${formData.role.toUpperCase()}! 🎉`);

        // 4. रोलनुसार नेव्हिगेशन
        if (formData.role === "specialist") {
          navigate("/profile");
        } else {
          navigate("/workers");
        }

      } else {
        alert(`❌ Error: ${result.error || "Registration failed"}`);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Could not connect to the server! ❌");
    }
  };

  return (
    <div className="auth-page" style={containerStyle}>
      <div className="auth-card" style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2 style={headerStyle}>Create Account</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px" }}>Join the Work Force community</p>
        </div>

        <form onSubmit={handleRegister}>
          {/* पूर्ण नाव */}
          <div style={inputGroup}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Jayesh Patil"
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* रोल निवडणे */}
          <div style={inputGroup}>
            <label style={labelStyle}>Join as a...</label>
            <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
              <option value="client">Client (Looking for Services)</option>
              <option value="specialist">Specialist (Providing Services)</option>
            </select>
          </div>

          {/* --- ट्रेड ड्रॉपडाउन (फक्त कामगारांसाठी दिसेल) --- */}
          {formData.role === "specialist" && (
            <div style={inputGroup}>
              <label style={labelStyle}>Your Trade (तुमचे काम निवडा)</label>
              <select
                name="trade"
                value={formData.trade}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="">-- निवडा --</option>
                <option value="Plumber">Plumber (नळ कारागीर)</option>
                <option value="Electrician">Electrician (वीज कारागीर)</option>
                <option value="Carpenter">Carpenter (सुतार)</option>
                <option value="Driver">Driver (चालक)</option>
                <option value="Cleaner">Cleaner (स्वच्छता कामगार)</option>
              </select>
            </div>
          )}

          {/* ईमेल आणि फोन */}
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" placeholder="email@example.com" onChange={handleChange} style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Phone</label>
              <input type="tel" name="phone" placeholder="10-digit number" onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          {/* पत्ता (Address) */}
          <div style={inputGroup}>
            <label style={labelStyle}>Residential Address</label>
            <textarea
              name="address"
              placeholder="Building, Street, City, Landmark..."
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: "80px", resize: "none" }}
              required
            />
          </div>

          {/* पासवर्ड */}
          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" placeholder="Min. 6 characters" onChange={handleChange} style={inputStyle} required />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Re-enter password" onChange={handleChange} style={inputStyle} required />
          </div>

          <button type="submit" style={btnStyle}>Register Now</button>
        </form>

        <p style={footerTextStyle}>
          Already have an account? <Link to="/login" style={linkStyle}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

// --- CSS Styles ---
const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px", background: "#f8fafc", fontFamily: "'Inter', sans-serif" };
const cardStyle = { width: "100%", maxWidth: "500px", padding: "40px", background: "white", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };
const headerStyle = { color: "#1e293b", fontWeight: "800", fontSize: "28px", margin: 0 };
const inputGroup = { marginBottom: "18px" };
const rowStyle = { display: "flex", gap: "15px", marginBottom: "18px" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "8px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxSizing: "border-box", outline: "none", fontSize: "15px", background: "#fcfdfe", transition: "0.2s" };
const btnStyle = { width: "100%", padding: "14px", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", marginTop: "10px", fontWeight: "700", cursor: "pointer", fontSize: "16px" };
const footerTextStyle = { textAlign: "center", marginTop: "20px", color: "#64748b", fontSize: "14px" };
const linkStyle = { color: "#2563eb", textDecoration: "none", fontWeight: "700" };

export default Register;