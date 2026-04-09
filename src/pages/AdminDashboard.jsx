import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkers: 0, totalBookings: 0, revenue: 0, totalLive: 0 });
  const [allData, setAllData] = useState([]); 
  const [allBookings, setAllBookings] = useState([]); 
  const [displayData, setDisplayData] = useState([]); 
  const [activeTab, setActiveTab] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000"; 

  // ✅ Fix: last_seen १ मिनिटापेक्षा कमी असेल तरच 'Live' दाखवा (बॅकएंडप्रमाणे)
  const isUserLive = (lastSeen) => {
    if (!lastSeen) return false;
    const now = new Date();
    const lastActivity = new Date(lastSeen);
    const diffInSeconds = (now - lastActivity) / 1000;
    return diffInSeconds < 65; // १ मिनिट (६० सेकंद) + ५ सेकंद बफर
  };

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setRefreshing(true);
      
      const headers = { "Content-Type": "application/json" };

      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, { headers }),
        fetch(`${API_BASE}/api/admin/all-users`, { headers }),
        fetch(`${API_BASE}/api/admin/all-bookings`, { headers })
      ]);

      const statsJson = await statsRes.json();
      const usersJson = await usersRes.json();
      const bookingsJson = await bookingsRes.json();

      if (statsJson.success) setStats(statsJson.stats);
      if (usersJson.success) setAllData(usersJson.users);
      if (bookingsJson.success) setAllBookings(bookingsJson.bookings);

    } catch (error) {
      console.error("❌ Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // ✅ दर १५ सेकंदांनी डेटा रिफ्रेश करा जेणेकरून 'Live' स्टेटस लगेच अपडेट होईल
    const statusInterval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(statusInterval);
  }, [fetchData]);

  useEffect(() => {
    let filtered = [];
    const term = searchTerm.toLowerCase();

    if (activeTab === "bookings") {
      filtered = allBookings.filter(b => 
        b.client_phone?.includes(term) || 
        b.worker_phone?.includes(term) || 
        b.work_location?.toLowerCase().includes(term)
      );
    } else {
      let baseData = [...allData];
      if (activeTab === "specialist") {
        baseData = allData.filter(u => u.role === "specialist");
      } else if (activeTab === "client") {
        baseData = allData.filter(u => u.role === "client");
      } else if (activeTab === "live") {
        baseData = allData.filter(u => isUserLive(u.last_seen));
      }

      filtered = baseData.filter(item => 
        item.full_name?.toLowerCase().includes(term) ||
        item.phone?.includes(term) ||
        item.trade?.toLowerCase().includes(term)
      );
    }
    setDisplayData(filtered);
  }, [activeTab, searchTerm, allData, allBookings]);

  const handleLogout = () => { sessionStorage.clear(); navigate("/login"); };
  const getUserActivity = (phone) => allBookings.filter(b => b.client_phone === phone || b.worker_phone === phone);

  if (loading) return <div style={loaderStyle}>Loading dashboard data... 🔃</div>;

  return (
    <div style={adminContainer}>
      <header style={headerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#1e293b", fontWeight: "800" }}>Admin Control Center</h1>
            <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>Manage workforce platform</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => fetchData(true)} style={refreshBtn} disabled={refreshing}>
              {refreshing ? "🔄 Refreshing..." : "🔄 Refresh Data"}
            </button>
            <button onClick={handleLogout} style={backBtn}>Logout</button>
          </div>
        </div>
      </header>

      {/* --- Stats Cards --- */}
      <div style={statsGrid}>
        <div style={{ ...statCard, borderBottom: activeTab === "all" ? "6px solid #2563eb" : "6px solid transparent" }} onClick={() => setActiveTab("all")}>
          <span style={statLabel}>Total Members</span>
          <h2 style={statValue}>{stats.totalUsers}</h2>
          <p style={viewLink}>View All Members →</p>
        </div>

        <div style={{ ...statCard, borderBottom: activeTab === "live" ? "6px solid #10b981" : "6px solid transparent" }} onClick={() => setActiveTab("live")}>
          <span style={statLabel}>Users Currently Live</span>
          <h2 style={{ ...statValue, color: "#10b981" }}>
            {/* ✅ आता हा आकडा server.js मधील आकड्याशी मॅच होईल */}
            {stats.totalLive}
          </h2>
          <p style={{ ...viewLink, color: "#10b981" }}>View Live Members →</p>
        </div>

        <div style={{ ...statCard, borderBottom: activeTab === "bookings" ? "6px solid #f59e0b" : "6px solid transparent" }} onClick={() => setActiveTab("bookings")}>
          <span style={statLabel}>Total Bookings</span>
          <h2 style={{ ...statValue, color: "#f59e0b" }}>{stats.totalBookings}</h2>
          <p style={{ ...viewLink, color: "#f59e0b" }}>View All Bookings →</p>
        </div>

        <div style={statCard}>
          <span style={statLabel}>Total Revenue</span>
          <h2 style={{ ...statValue, color: "#8b5cf6" }}>₹{stats.revenue}</h2>
          <p style={{ ...viewLink, color: "#8b5cf6" }}>Financial Report</p>
        </div>
      </div>

      <div style={tableWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0 }}>
            {activeTab === "bookings" ? "Platform Booking History" : `Registered Members (${displayData.length})`}
          </h3>
          <input 
            type="text" 
            placeholder={activeTab === "bookings" ? "Search phone or location..." : "Search name or phone..."} 
            style={searchInput} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ textAlign: "left", background: "#f8fafc" }}>
                {activeTab === "bookings" ? (
                  <>
                    <th style={thStyle}>Client Phone</th>
                    <th style={thStyle}>Worker Phone</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                  </>
                ) : (
                  <>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Trade</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, index) => (
                <tr key={index} style={trStyle}>
                  {activeTab === "bookings" ? (
                    <>
                      <td style={tdStyle}>{item.client_phone}</td>
                      <td style={tdStyle}>{item.worker_phone}</td>
                      <td style={tdStyle}>{item.work_location}</td>
                      <td style={tdStyle}>
                        <span style={{ ...roleBadge, background: '#fef3c7', color: '#92400e' }}>{item.status}</span>
                      </td>
                      <td style={tdStyle}>{new Date(item.created_at).toLocaleDateString()}</td>
                    </>
                  ) : (
                    <>
                      <td style={tdStyle}><b>{item.full_name}</b></td>
                      <td style={tdStyle}>
                        <span style={{ ...roleBadge, background: item.role === 'specialist' ? '#dcfce7' : '#dbeafe', color: item.role === 'specialist' ? '#166534' : '#1e40af' }}>
                          {item.role}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.trade || "Customer"}</td>
                      <td style={tdStyle}>
                        <span style={{ ...statusDot, backgroundColor: isUserLive(item.last_seen) ? "#10b981" : "#94a3b8" }}></span>
                        <span style={{ fontSize: "13px", color: isUserLive(item.last_seen) ? "#10b981" : "#64748b" }}>
                          {isUserLive(item.last_seen) ? "Live" : "Offline"}
                        </span>
                      </td>
                      <td style={tdStyle}><button style={viewBtn} onClick={() => setSelectedUser(item)}>Quick View</button></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- QUICK VIEW MODAL --- */}
      {selectedUser && (
        <div style={modalOverlay} onClick={() => setSelectedUser(null)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ margin: 0 }}>{selectedUser.full_name}</h2>
                <span style={{ ...statusDot, backgroundColor: isUserLive(selectedUser.last_seen) ? "#10b981" : "#94a3b8" }}></span>
              </div>
              <button style={closeBtn} onClick={() => setSelectedUser(null)}>&times;</button>
            </div>
            
            <div style={modalBody}>
              <div style={infoGrid}>
                <div style={infoItem}><strong>Phone:</strong> {selectedUser.phone}</div>
                <div style={infoItem}><strong>Email:</strong> {selectedUser.email || "N/A"}</div>
                <div style={infoItem}><strong>Role:</strong> {selectedUser.role}</div>
                <div style={infoItem}><strong>Trade:</strong> {selectedUser.trade || "Customer"}</div>
                <div style={{ ...infoItem, gridColumn: "span 2", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                  <strong>Address:</strong> {selectedUser.address || "No address provided"}
                </div>
              </div>

              <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Recent Activity</h4>
              <div style={historyScroll}>
                {getUserActivity(selectedUser.phone).length > 0 ? (
                  <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                    <tbody>
                      {getUserActivity(selectedUser.phone).map((act, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 0" }}>{act.client_phone === selectedUser.phone ? "Sent Booking" : "Received Task"}</td>
                          <td style={{ textAlign: "right", color: "#10b981", fontWeight: "bold" }}>{act.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: "#94a3b8" }}>No recent activity.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles (तेच ठेवले आहेत) ---
const statusDot = { height: "10px", width: "10px", borderRadius: "50%", display: "inline-block", marginRight: "8px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContent = { background: "#fff", width: "95%", maxWidth: "500px", borderRadius: "15px", padding: "20px" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" };
const modalBody = { display: "flex", flexDirection: "column" };
const infoGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f8fafc", padding: "15px", borderRadius: "10px" };
const infoItem = { fontSize: "14px" };
const historyScroll = { maxHeight: "150px", overflowY: "auto" };
const closeBtn = { background: "none", border: "none", fontSize: "24px", cursor: "pointer" };
const viewBtn = { padding: "5px 10px", background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: "5px", cursor: "pointer" };
const refreshBtn = { padding: "8px 15px", background: "#fff", color: "#2563eb", border: "1px solid #2563eb", borderRadius: "8px", cursor: "pointer" };
const adminContainer = { padding: "20px", maxWidth: "1200px", margin: "0 auto" };
const headerStyle = { marginBottom: "30px" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" };
const statCard = { background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer" };
const statLabel = { fontSize: "12px", color: "#64748b" };
const statValue = { fontSize: "28px", margin: "5px 0" };
const viewLink = { margin: 0, fontSize: "11px", color: "#2563eb" };
const tableWrapper = { background: "#fff", padding: "20px", borderRadius: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const searchInput = { padding: "8px", borderRadius: "5px", border: "1px solid #e2e8f0", width: "200px" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { padding: "12px", borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "14px" };
const tdStyle = { padding: "12px", borderBottom: "1px solid #f1f5f9", fontSize: "14px" };
const roleBadge = { padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" };
const backBtn = { padding: "8px 15px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer" };
const loaderStyle = { textAlign: "center", padding: "50px" };
const trStyle = { transition: "0.2s" };

export default AdminDashboard;