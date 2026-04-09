import React, { useState, useEffect } from "react";
import "../index.css";

function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [filterType, setFilterType] = useState("latest");
  const [loading, setLoading] = useState(true);

  // ✅ persistence साठी दोन्ही स्टोरेज वापरले आहेत
  const [role, setRole] = useState(sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || "client");
  const [currentPhone, setCurrentPhone] = useState((sessionStorage.getItem("userPhone") || "").trim());

  const tradeOptions = ["Plumber", "Electrician", "Carpenter", "Painter", "Driver", "Mechanic", "Cleaner"];

  const [userData, setUserData] = useState({
    name: "User Name",
    email: "",
    phone: "",
    skill: "Plumber",
    experience: "0",
    skills: "",
    address: ""
  });

  const [historyData, setHistoryData] = useState([]);

  // --- API: Fetch User Profile ---
  const fetchProfileData = async () => {
    if (!currentPhone || currentPhone === "ADMIN") {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${currentPhone}`);
      if (response.ok) {
        const data = await response.json();
        
        // ✅ FIX: बॅकएंड 'profile' की पाठवत आहे, 'user' नाही
        if (data.success && data.profile) {
          const myProfile = data.profile;
          setUserData({
            name: myProfile.full_name || "User Name",
            email: myProfile.email || "",
            phone: myProfile.phone || currentPhone,
            skill: myProfile.trade || "Plumber",
            experience: (myProfile.experience_years || 0).toString(),
            skills: myProfile.skills || "",
            address: myProfile.address || ""
          });

          // स्टोरेज अपडेट
          localStorage.setItem("userName", myProfile.full_name);
          sessionStorage.setItem("userName", myProfile.full_name);
        }
      }
    } catch (error) {
      console.error("❌ Profile Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- API: Save Profile Changes ---
  const handleSave = async () => {
    try {
      const payload = {
        phone: userData.phone,
        email: userData.email,
        name: userData.name, // बॅकएंड 'name' की ने डेटा घेतेय
        trade: userData.skill,
        experience_years: parseInt(userData.experience) || 0,
        skills: userData.skills,
        address: userData.address
      };

      // ✅ FIX: प्रोफाइल अपडेटसाठी बॅकएंडमध्ये 'PUT' मेथड वापरली आहे
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setIsEditing(false);
        localStorage.setItem("userName", userData.name);
        sessionStorage.setItem("userName", userData.name);
        
        // Navbar ला अपडेट कळवण्यासाठी
        window.dispatchEvent(new Event("nameUpdated"));
        
        alert("Profile Updated Successfully! ✅");
        await fetchProfileData(); 
      } else {
        alert(result.error || "Update failed");
      }
    } catch (error) {
      console.error("❌ Update Error:", error);
      alert("❌ Server connection failed.");
    }
  };

  // --- API: Fetch Booking History ---
  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/my-bookings/${currentPhone}`);
      const data = await response.json();

      if (data.success) {
        let filtered = data.bookings;
        if (activeTab === "history") {
          filtered = data.bookings.filter(item =>
            ["Completed", "Cancelled", "Rejected"].includes(item.status)
          );
        }
        if (filterType === "latest") filtered.sort((a, b) => b.id - a.id);
        else filtered.sort((a, b) => a.id - b.id);
        setHistoryData(filtered);
      }
    } catch (error) {
      console.error("❌ History Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [currentPhone]);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab, filterType]);

  const handleRoleSwitch = (newRole) => {
    if (newRole === role) return;
    sessionStorage.setItem("userRole", newRole);
    localStorage.setItem("userRole", newRole);
    setRole(newRole);
    window.dispatchEvent(new Event("roleUpdated"));
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
      <p>Loading Profile...</p>
    </div>
  );

  return (
    <div className="profile-page" style={pageContainerStyle}>
      <div style={wrapperStyle}>
        {/* Sidebar */}
        <aside style={sidebarStyle}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={avatarContainer(isEditing)}>
              <span style={{ fontSize: "36px", fontWeight: "800", color: "#2563eb" }}>
                {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <h3 style={{ margin: "15px 0 5px", color: "#1e293b", fontWeight: "700" }}>{userData.name}</h3>
            <span style={roleBadgeStyle(role)}>{role.toUpperCase()}</span>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button style={tabBtnStyle(activeTab === 'profile')} onClick={() => setActiveTab("profile")}>👤 Personal Info</button>
            <button style={tabBtnStyle(activeTab === 'history')} onClick={() => setActiveTab("history")}>📜 History</button>
            <button style={tabBtnStyle(activeTab === 'settings')} onClick={() => setActiveTab("settings")}>⚙️ Settings</button>
            <button style={logoutBtnStyle} onClick={handleLogout}>🚪 Log Out</button>
          </nav>
        </aside>

        {/* Main Panel */}
        <main style={mainContentStyle}>
          {activeTab === "profile" && (
            <div className="fade-in">
              <div style={contentHeader}>
                <h2 style={{ color: "#1e293b", margin: 0 }}>Personal Details</h2>
                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={editBtnStyle(isEditing)}>
                  {isEditing ? "✅ Save Changes" : "✏️ Edit Profile"}
                </button>
              </div>
              <div style={formGrid}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle(isEditing)} value={userData.name} disabled={!isEditing} onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Mobile Number</label>
                  <input style={inputStyle(false)} value={userData.phone} disabled={true} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Email Address</label>
                  <input style={inputStyle(isEditing)} value={userData.email} disabled={!isEditing} onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Location / Address</label>
                  <input
                    style={inputStyle(isEditing)}
                    placeholder="City, Area or Street"
                    value={userData.address}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  />
                </div>

                {role === "specialist" && (
                  <>
                    <div style={inputGroup}>
                      <label style={labelStyle}>Primary Trade</label>
                      <select style={inputStyle(isEditing)} value={userData.skill} disabled={!isEditing} onChange={(e) => setUserData({ ...userData, skill: e.target.value })}>
                        {tradeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div style={inputGroup}>
                      <label style={labelStyle}>Experience (Years)</label>
                      <input type="number" style={inputStyle(isEditing)} value={userData.experience} disabled={!isEditing} onChange={(e) => setUserData({ ...userData, experience: e.target.value })} />
                    </div>
                    <div style={{ ...inputGroup, gridColumn: "span 2" }}>
                      <label style={labelStyle}>Skills (Comma separated)</label>
                      <textarea
                        style={{ ...inputStyle(isEditing), minHeight: "80px", resize: "vertical" }}
                        value={userData.skills}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({ ...userData, skills: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="fade-in">
              <div style={contentHeader}>
                <h2 style={{ color: "#1e293b", margin: 0 }}>Service History</h2>
                <select style={filterSelectStyle} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="latest">🆕 Latest First</option>
                  <option value="oldest">⌛ Oldest First</option>
                </select>
              </div>
              {historyData.length > 0 ? historyData.map((item) => (
                <div key={item.id} style={historyCardStyle}>
                  <div>
                    <h4 style={{ margin: 0 }}>Order #{item.id}</h4>
                    <p style={professionSubtext}>📍 {item.work_location}</p>
                    <small style={{ color: "#64748b" }}>📅 {new Date(item.booking_date).toLocaleDateString()}</small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={statusBadge(item.status)}>{item.status}</div>
                    <div style={priceTextStyle}>Worker: {item.worker_phone}</div>
                  </div>
                </div>
              )) : (
                <div style={emptyHistoryStyle}>
                  <p style={{ fontSize: "40px" }}>📜</p>
                  <p>No history records found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="fade-in">
              <h2 style={{ color: "#1e293b" }}>Account Settings</h2>
              <div style={settingsCard}>
                <h4 style={{ marginBottom: "15px" }}>Switch Account Role</h4>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                  Currently acting as a <b>{role}</b>.
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleRoleSwitch("client")} style={roleBtn(role === "client", "#2563eb")}>Client Mode</button>
                  <button onClick={() => handleRoleSwitch("specialist")} style={roleBtn(role === "specialist", "#16a34a")}>Specialist Mode</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Styles (आधीचेच आहेत) ---
const pageContainerStyle = { padding: "40px 5%", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const wrapperStyle = { display: "flex", gap: "30px", maxWidth: "1100px", margin: "0 auto" };
const sidebarStyle = { flex: "0 0 280px", background: "#fff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" };
const mainContentStyle = { flex: 1, background: "#fff", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", minHeight: "550px" };
const avatarContainer = (isEditing) => ({ width: "90px", height: "90px", margin: "0 auto", borderRadius: "22px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: isEditing ? "2px dashed #2563eb" : "none" });
const roleBadgeStyle = (role) => ({ fontSize: "11px", fontWeight: "800", background: role === "specialist" ? "#dcfce7" : "#eff6ff", color: role === "specialist" ? "#16a34a" : "#2563eb", padding: "5px 14px", borderRadius: "8px", marginTop: "10px", display: "inline-block" });
const tabBtnStyle = (isActive) => ({ width: "100%", textAlign: "left", padding: "12px 18px", borderRadius: "12px", border: "none", background: isActive ? "#2563eb" : "transparent", color: isActive ? "#fff" : "#64748b", fontWeight: "600", cursor: "pointer", transition: "0.2s" });
const contentHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };
const editBtnStyle = (isEditing) => ({ background: isEditing ? "#16a34a" : "#f1f5f9", color: isEditing ? "#fff" : "#1e293b", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" });
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "12px", fontWeight: "700", color: "#64748b" };
const inputStyle = (isEditing) => ({ padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: isEditing ? "#fff" : "#f8fafc", outline: "none", fontSize: "14px", color: "#1e293b" });
const historyCardStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderRadius: "15px", border: "1px solid #f1f5f9", marginBottom: "12px", background: "#fff" };
const professionSubtext = { margin: "5px 0 0", color: "#2563eb", fontSize: "13px", fontWeight: "600" };
const priceTextStyle = { fontSize: "14px", fontWeight: "bold", marginTop: "5px", color: "#0f172a" };
const emptyHistoryStyle = { textAlign: "center", padding: "40px", color: "#64748b" };
const statusBadge = (status) => ({
  fontSize: "10px", fontWeight: "bold", padding: "5px 12px", borderRadius: "8px", display: "inline-block",
  background: status === "Completed" ? "#dcfce7" : (status === "Cancelled" ? "#fee2e2" : "#fef3c7"),
  color: status === "Completed" ? "#16a34a" : (status === "Cancelled" ? "#dc2626" : "#d97706")
});
const settingsCard = { padding: "25px", background: "#f8fafc", borderRadius: "18px", border: "1px solid #e2e8f0" };
const roleBtn = (isActive, color) => ({ padding: "12px 24px", borderRadius: "10px", border: "none", background: isActive ? color : "#fff", color: isActive ? "#fff" : "#64748b", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" });
const logoutBtnStyle = { width: "100%", marginTop: "20px", padding: "12px", borderRadius: "12px", border: "none", background: "#fee2e2", color: "#ef4444", fontWeight: "700", cursor: "pointer" };
const filterSelectStyle = { padding: "10px 15px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "14px", fontWeight: "600", color: "#475569", outline: "none", cursor: "pointer" };

export default Profile;