import React, { useState } from "react";

function SecuritySettings() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveSecurity = () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;
    
    // Retrieving the current stored password (fallback to '123456' if none exists)
    const savedPassword = localStorage.getItem("userPassword") || "123456"; 

    // 1. Validation for empty fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required! ⚠️");
      return;
    }
    
    // 2. Verify current password
    if (currentPassword !== savedPassword) {
      alert("The current password you entered is incorrect! ❌");
      return;
    }
    
    // 3. Check if new passwords match
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match! ❌");
      return;
    }

    // 4. Update password in storage
    localStorage.setItem("userPassword", newPassword);
    alert("Password updated successfully! ✅");
    
    // Reset form fields
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <section style={sectionStyle}>
      <h3 style={headerStyle}>Update Password</h3>
      
      <div style={inputGroupStyle}>
        <label style={labelStyle}>Current Password</label>
        <input 
          type="password" 
          name="currentPassword" 
          value={passwords.currentPassword} 
          onChange={handleInputChange} 
          placeholder="Enter current password" 
          style={inputStyle}
        />
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle}>New Password</label>
        <input 
          type="password" 
          name="newPassword" 
          value={passwords.newPassword} 
          onChange={handleInputChange} 
          placeholder="Enter new password" 
          style={inputStyle}
        />
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle}>Confirm New Password</label>
        <input 
          type="password" 
          name="confirmPassword" 
          value={passwords.confirmPassword} 
          onChange={handleInputChange} 
          placeholder="Confirm new password" 
          style={inputStyle}
        />
      </div>

      <button onClick={handleSaveSecurity} style={btnStyle}>
        Update Password
      </button>
    </section>
  );
}

// --- Styles ---
const sectionStyle = { maxWidth: "100%", padding: "0", fontFamily: "'Inter', sans-serif" };
const headerStyle = { fontSize: "1.1rem", color: "#2563eb", marginBottom: "20px", fontWeight: "700" };
const inputGroupStyle = { marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#64748b" };
const inputStyle = { 
  width: "100%", 
  padding: "12px", 
  borderRadius: "10px", 
  border: "1px solid #e2e8f0", 
  background: "#f8fafc", 
  outline: "none", 
  fontSize: "14px", 
  transition: "0.2s" 
};
const btnStyle = { 
  width: "fit-content", 
  padding: "12px 30px", 
  background: "#2563eb", 
  color: "white", 
  border: "none", 
  borderRadius: "10px", 
  fontWeight: "700", 
  cursor: "pointer", 
  fontSize: "14px",
  transition: "background 0.3s"
};

export default SecuritySettings;