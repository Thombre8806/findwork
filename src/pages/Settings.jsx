import React, { useState, useEffect } from "react";
import SecuritySettings from "./SecuritySettings";
import "../index.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  // सुरुवातीचा रोल ठरवण्यासाठी लॉजिक
  const getInitialRole = () => {
    return sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || "client";
  };

  const [role, setRole] = useState(getInitialRole());

  const [tradesData, setTradesData] = useState({
    primary_trade: "Plumber",
    license_number: "",
    experience_years: ""
  });

  useEffect(() => {
    // नॅव्हबारप्रमाणेच इथला रोल सुद्धा सिंकमध्ये ठेवण्यासाठी
    const handleSync = () => {
      setRole(getInitialRole());
    };

    window.addEventListener("roleUpdated", handleSync);
    return () => window.removeEventListener("roleUpdated", handleSync);
  }, []);

  const handleSaveAll = async () => {
    if (role === "specialist" && (!tradesData.license_number || !tradesData.experience_years)) {
      alert("Please fill in all specialist details before saving!");
      return;
    }

    try {
      // localStorage मधून नाव घेताना सुरक्षित पद्धत
      const storedName = localStorage.getItem("userName") || "User";

      const response = await fetch('http://localhost:5000/api/save-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: storedName,
          trade: tradesData.primary_trade,
          experience: parseInt(tradesData.experience_years) || 0,
          skills: tradesData.license_number
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Success: Settings updated successfully!");
      } else {
        alert("❌ Error: " + (result.error || "Failed to update settings."));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("❌ Server connection failed! Please ensure the Node.js backend is running.");
    }
  };

  const handleRoleSwitch = (newRole) => {
    if (newRole === role) return;

    const confirmSwitch = window.confirm(`Switch to ${newRole.toUpperCase()} mode? 🔄`);

    if (confirmSwitch) {
      // १. दोन्ही स्टोरेज अपडेट करा
      sessionStorage.setItem("userRole", newRole);
      localStorage.setItem("userRole", newRole);

      // २. लोकल स्टेट अपडेट करा
      setRole(newRole);

      // ३. 🚀 नॅव्हबारला सिग्नल पाठवा (हा सर्वात महत्त्वाचा भाग आहे)
      window.dispatchEvent(new Event("roleUpdated"));

      // जर टॅब 'trades' असेल आणि आता रोल 'client' झाला असेल, तर टॅब बदलून 'account' करा
      if (newRole === "client" && activeTab === "trades") {
        setActiveTab("account");
      }
    }
  };

  const menuItems = [
    { id: "account", label: "Account Settings", icon: "⚙️" },
    { id: "profile", label: "Profile Information", icon: "👤" },
    ...(role === "specialist" ? [{ id: "trades", label: "Tradesperson Details", icon: "🏗️" }] : []),
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy & Security", icon: "🛡️" },
    { id: "help", label: "Help & Support", icon: "❓" },
  ];

  return (
    <div className="settings-container" style={pageStyle}>
      <div style={layoutWrapper}>

        {/* --- Sidebar --- */}
        <aside style={leftSidebar}>
          <div style={sidebarHeader}>
            <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#1e293b" }}>Settings</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "5px" }}>
              Logged in as: <strong style={{ color: role === 'specialist' ? '#16a34a' : '#2563eb' }}>{role.toUpperCase()}</strong>
            </p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={sidebarBtn(activeTab === item.id)}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button className="logout-btn" style={logoutStyle} onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
          }}>
            🚪 Log Out
          </button>
        </aside>

        {/* --- Main Content --- */}
        <main style={middleContent}>
          <div style={contentHeader}>
            <h1 style={{ fontSize: "1.6rem", color: "#1e293b", margin: 0 }}>
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div style={contentBody}>
            {activeTab === "account" && (
              <div className="fade-in">
                <section style={formSection}>
                  <h4 style={subHeading}>Account Mode</h4>
                  <div style={roleCardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "600", color: "#1e293b" }}>Switch account perspective</p>
                      <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        Choose 'Specialist' to accept jobs, or 'Client' to book professionals.
                      </p>
                    </div>
                    <div style={roleToggleGroup}>
                      <button onClick={() => handleRoleSwitch("client")} style={roleBtnStyle(role === "client", "client")}>Client</button>
                      <button onClick={() => handleRoleSwitch("specialist")} style={roleBtnStyle(role === "specialist", "specialist")}>Specialist</button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "trades" && role === "specialist" && (
              <div className="fade-in">
                <section style={formSection}>
                  <h4 style={subHeading}>Professional Information</h4>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Primary Trade</label>
                      <select
                        style={inputStyle}
                        value={tradesData.primary_trade}
                        onChange={(e) => setTradesData({ ...tradesData, primary_trade: e.target.value })}
                      >
                        <option>Plumber</option>
                        <option>Electrician</option>
                        <option>Carpenter</option>
                        <option>Painter</option>
                        <option>Driver</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Experience (Years)</label>
                      <input
                        type="number"
                        style={inputStyle}
                        placeholder="e.g. 5"
                        value={tradesData.experience_years}
                        onChange={(e) => setTradesData({ ...tradesData, experience_years: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section style={formSection}>
                  <h4 style={subHeading}>Verification & Licensing</h4>
                  <div style={inputGroup}>
                    <label style={labelStyle}>License Number / Certification ID</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. CERT-9920"
                      value={tradesData.license_number}
                      onChange={(e) => setTradesData({ ...tradesData, license_number: e.target.value })}
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === "privacy" && <SecuritySettings />}

            {(activeTab === "notifications" || activeTab === "help" || activeTab === "profile") && (
              <div style={emptyStateStyle}>
                <p style={{ fontSize: "40px" }}>🏗️</p>
                <p>This module is currently under development.</p>
              </div>
            )}
          </div>

          <footer style={footerStyle}>
            <button style={saveAllBtn} onClick={handleSaveAll}>Save All Changes</button>
          </footer>
        </main>

        {/* --- Right Sidebar --- */}
        <aside style={rightSidebar}>
          {role === "specialist" && (
            <div style={infoCard}>
              <h4 style={subHeading}>Sync Status</h4>
              <div style={scoreBox}>
                <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#16a34a" }}>Database Ready</span>
                <p style={{ fontSize: "0.75rem", marginTop: "8px", color: "#64748b", lineHeight: "1.4" }}>
                  Changes will be reflected in the marketplace instantly.
                </p>
              </div>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}

// --- Styles (सगळे जसेच्या तसे) ---
const pageStyle = { background: "#f1f5f9", minHeight: "100vh", padding: "30px 20px", fontFamily: "'Inter', sans-serif" };
const layoutWrapper = { display: "flex", maxWidth: "1300px", margin: "0 auto", gap: "25px", height: "auto" };
const leftSidebar = { flex: "0 0 280px", background: "#fff", borderRadius: "24px", padding: "25px", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "fit-content" };
const sidebarHeader = { marginBottom: "30px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px" };
const sidebarBtn = (isActive) => ({ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "14px 18px", borderRadius: "14px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "0.2s", background: isActive ? "#2563eb" : "transparent", color: isActive ? "#fff" : "#64748b" });
const middleContent = { flex: 1, background: "#fff", borderRadius: "24px", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden" };
const contentHeader = { padding: "25px 35px", borderBottom: "1px solid #f1f5f9" };
const contentBody = { padding: "35px", flex: 1, minHeight: "450px" };
const footerStyle = { padding: "20px 35px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" };
const rightSidebar = { flex: "0 0 300px", display: "flex", flexDirection: "column", gap: "20px" };
const infoCard = { background: "#fff", padding: "25px", borderRadius: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };
const formSection = { marginBottom: "35px" };
const subHeading = { fontSize: "1rem", fontWeight: "700", marginBottom: "15px", color: "#1e293b" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", background: "#fcfdfe" };
const inputGroup = { display: "flex", flexDirection: "column" };
const saveAllBtn = { background: "#1e293b", color: "#fff", padding: "16px", width: "100%", borderRadius: "14px", border: "none", fontWeight: "bold", cursor: "pointer", transition: "0.2s" };
const logoutStyle = { padding: "14px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "14px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" };
const roleCardStyle = { display: "flex", alignItems: "center", padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" };
const roleToggleGroup = { display: "flex", background: "#fff", padding: "5px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const roleBtnStyle = (isActive, type) => ({ padding: "10px 20px", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", background: isActive ? (type === "specialist" ? "#16a34a" : "#2563eb") : "transparent", color: isActive ? "#fff" : "#64748b" });
const scoreBox = { background: "#f0fdf4", padding: "20px", borderRadius: "16px", textAlign: "center", border: "1px solid #dcfce7" };
const emptyStateStyle = { textAlign: "center", padding: "60px 20px", color: "#64748b" };

export default Settings;