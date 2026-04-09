import React, { useState, useEffect } from "react";

function MyTasks() {
  const [role, setRole] = useState(sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || "client");
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [loading, setLoading] = useState(true);

  // ✅ फोन नंबर मिळवण्यासाठी अधिक सुरक्षित पद्धत
  const userPhone = (sessionStorage.getItem("userPhone") || localStorage.getItem("userPhone") || "").trim();

  // --- API: Fetch Tasks ---
  const fetchTasks = async () => {
    if (!userPhone) return;
    setLoading(true);
    try {
      // ✅ FIX: admin/bookings ऐवजी my-bookings वापरला आहे जेणेकरून फक्त स्वतःचे टास्क दिसतील
      const response = await fetch(`http://localhost:5000/api/my-bookings/${userPhone}`);
      const data = await response.json();

      // बॅकएंड रिस्पॉन्समध्ये 'bookings' की (key) तपासा
      if (data.success) {
        setTasks(data.bookings || []);
      } else {
        // जर बॅकएंड थेट ॲरे पाठवत असेल (Fallback)
        if (Array.isArray(data)) {
          setTasks(data);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // दर ३० सेकंदांनी रिफ्रेश करण्यासाठी (Real-time अनुभव)
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [userPhone]);

  // --- API: Update Status ---
  const updateStatus = async (bookingId, newStatus) => {
    const confirmChange = window.confirm(`Are you sure you want to mark this as ${newStatus}?`);
    if (!confirmChange) return;

    try {
      const response = await fetch(`http://localhost:5000/api/update-booking-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Status updated to ${newStatus}! ✅`);
        fetchTasks();
      }
    } catch (error) {
      alert("❌ Status update failed!");
    }
  };

  // --- Helper: Count tasks per status ---
  const getCount = (status) => {
    return tasks.filter(t => {
      const isOwner = role === "client"
        ? String(t.client_phone).trim() === userPhone
        : String(t.worker_phone).trim() === userPhone;
      return isOwner && t.status === status;
    }).length;
  };

  // --- Filtering ---
  const filteredTasks = tasks.filter(task => {
    const isRoleMatch = role === "client"
      ? String(task.client_phone).trim() === userPhone
      : String(task.worker_phone).trim() === userPhone;

    return isRoleMatch && task.status === activeTab;
  });

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header */}
        <div style={headerFlex}>
          <div>
            <h1 style={{ color: "#1e293b", margin: 0, fontSize: "28px", fontWeight: "800" }}>
              {role === "client" ? "📅 My Bookings" : "🛠️ My Work Tasks"}
            </h1>
            <p style={{ color: "#64748b", marginTop: "5px" }}>
              {role === "client"
                ? "Manage your service requests and track updates."
                : "View and manage tasks assigned to you by clients."}
            </p>
          </div>
          <div style={roleBadge(role)}>{role.toUpperCase()} VIEW</div>
        </div>

        {/* Tabs Section */}
        <div style={tabContainer}>
          {["Pending", "Accepted", "Completed", "Cancelled", "Rejected"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={tabButtonStyle(activeTab === tab)}
            >
              {tab} <span style={countBadge(activeTab === tab)}>{getCount(tab)}</span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={listStyle}>
          {loading ? (
            <div style={emptyState}>
              <div className="spinner"></div>
              <p>Fetching your tasks...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} style={cardStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px" }}>
                      {role === "client"
                        ? `Worker: ${task.worker_name || task.worker_phone}`
                        : `Client Phone: ${task.client_phone}`}
                    </h3>
                    <span style={statusTag(task.status)}>{task.status}</span>
                  </div>

                  <div style={infoGrid}>
                    <p style={infoText}>📍 <strong>Location:</strong> {task.work_location}</p>
                    <p style={infoText}>📅 <strong>Date:</strong> {task.booking_date}</p>
                    <p style={infoText}>⏰ <strong>Time:</strong> {task.booking_time}</p>
                  </div>
                </div>

                <div style={{ textAlign: "right", marginLeft: "20px" }}>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>

                    {/* Specialist Buttons */}
                    {role === "specialist" && task.status === "Pending" && (
                      <>
                        <button onClick={() => updateStatus(task.id, "Rejected")} style={rejectBtn}>Reject</button>
                        <button onClick={() => updateStatus(task.id, "Accepted")} style={acceptBtn}>Accept Task</button>
                      </>
                    )}
                    {role === "specialist" && task.status === "Accepted" && (
                      <button onClick={() => updateStatus(task.id, "Completed")} style={completeBtn}>Finish Work</button>
                    )}

                    {/* Client Buttons */}
                    {role === "client" && (task.status === "Pending" || task.status === "Accepted") && (
                      <button onClick={() => updateStatus(task.id, "Cancelled")} style={cancelBtn}>Cancel Booking</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={emptyState}>
              <p style={{ fontSize: "50px", margin: 0 }}>📋</p>
              <h3 style={{ margin: "10px 0", color: "#1e293b" }}>No {activeTab} Tasks</h3>
              <p>Items in this category will appear here once updated.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Styles (Fixed for Clean UI) ---
const pageStyle = { padding: "40px 20px", backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "sans-serif" };
const headerFlex = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "35px" };
const roleBadge = (role) => ({ background: role === "specialist" ? "#dcfce7" : "#eff6ff", color: role === "specialist" ? "#16a34a" : "#2563eb", padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", letterSpacing: "0.5px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" });

const tabContainer = { display: "flex", gap: "10px", marginBottom: "30px", overflowX: "auto", padding: "5px" };
const tabButtonStyle = (isActive) => ({ padding: "12px 20px", border: "none", background: isActive ? "#2563eb" : "#fff", color: isActive ? "white" : "#64748b", borderRadius: "12px", cursor: "pointer", fontWeight: "700", boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "0 2px 4px rgba(0,0,0,0.03)", transition: "0.3s", display: "flex", alignItems: "center", gap: "8px" });
const countBadge = (isActive) => ({ background: isActive ? "rgba(255,255,255,0.2)" : "#f1f5f9", color: isActive ? "white" : "#64748b", padding: "2px 8px", borderRadius: "6px", fontSize: "12px" });

const listStyle = { display: "flex", flexDirection: "column", gap: "16px" };
const cardStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", transition: "transform 0.2s" };

const infoGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginTop: "10px" };
const infoText = { color: "#475569", fontSize: "14px", margin: 0, display: "flex", alignItems: "center", gap: "5px" };

const statusTag = (status) => ({ background: status === "Accepted" ? "#dcfce7" : status === "Pending" ? "#fef3c7" : "#f1f5f9", color: status === "Accepted" ? "#16a34a" : status === "Pending" ? "#d97706" : "#475569", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" });

const acceptBtn = { background: "#2563eb", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "700", transition: "0.2s" };
const completeBtn = { background: "#16a34a", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "700" };
const rejectBtn = { background: "#fff", color: "#dc2626", border: "1px solid #fee2e2", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "700" };
const cancelBtn = { background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "700" };

const emptyState = { textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "24px", color: "#94a3b8", border: "2px dashed #cbd5e1" };

export default MyTasks;