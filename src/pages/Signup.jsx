import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../index.css";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "client", // Default role
    password: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      // Send registration data to the Node.js backend
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert("Account Created Successfully! 🎉 Please login to continue.");
        navigate("/login"); 
      } else {
        alert(`❌ Signup Failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Server is not responding. Please check your backend connection! ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join WorkforceConnect to find the best workers</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Om Thorat" 
              required
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>Join as a...</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={selectStyle}
            >
              <option value="client">Client (Need a Service)</option>
              <option value="specialist">Specialist (Offering Service)</option>
            </select>
          </div>

          <div className="input-row" style={rowStyle}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="user@example.com" 
                required
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="10 digit number" 
                required
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Create Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="login-submit-btn" style={{ marginTop: "10px" }}>
            Register Now
          </button>

          <div className="auth-footer" style={{ textAlign: "center", marginTop: "20px" }}>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              Already have an account? <Link to="/login" style={linkStyle}>Sign In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Inline Styles for Layout Adjustments ---
const rowStyle = {
  display: "flex",
  gap: "15px",
  marginBottom: "15px"
};

const selectStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: "14px",
  outline: "none"
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: "700"
};

export default Signup;