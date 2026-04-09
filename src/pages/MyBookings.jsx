import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userPhone = sessionStorage.getItem("userPhone");

  const loadBookings = useCallback(async () => {
    const auth = sessionStorage.getItem("isLoggedIn") === "true";
    if (!auth || !userPhone) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/my-bookings/${userPhone}`);
      const data = await response.json();

      console.log("Backend Response:", data);

      if (data.success) {
        // केवळ Pending आणि Accepted स्टेटस असलेल्या बुकिंग्स दाखवण्यासाठी फिल्टर
        const activeOnly = data.bookings.filter(
          (b) => b.status === "Pending" || b.status === "Accepted"
        );
        setBookings(activeOnly);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [userPhone, navigate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (id) => {
    if (window.confirm("तुम्हाला खात्री आहे की ही विनंती रद्द करायची आहे?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/update-booking-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: id, status: "Cancelled" })
        });

        const data = await response.json();
        if (data.success) {
          setBookings(prev => prev.filter(b => b.id !== id));
          alert("बुकिंग यशस्वीरित्या रद्द झाले! ✅");
        }
      } catch (error) {
        alert("रद्द करताना तांत्रिक अडचण आली.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Active Requests</h2>
          <p style={subTitleStyle}>तुम्ही सध्या {bookings.length} सेवा बुक केल्या आहेत</p>
        </div>
        <button onClick={() => navigate("/workers")} style={addButtonStyle}>+ New Booking</button>
      </header>

      <div style={listStyle}>
        {loading ? (
          <div style={loaderStyle}>माहिती मिळवत आहे... ⏳</div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <div 
              key={booking.id} 
              style={glassCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.borderColor = "#f1f5f9";
              }}
            >
              <div style={statusSection}>
                <div style={iconBox(booking.status)}>
                  {booking.status === "Accepted" ? "✅" : "⏳"}
                </div>
                <div style={verticalLine} />
              </div>

              <div style={infoSection}>
                <div style={topRow}>
                  <span style={orderIdText}>REQ-00{booking.id}</span>
                  <span style={badgeStyle(booking.status)}>{booking.status}</span>
                </div>
                
                {/* ✅ नाव दाखवण्यासाठी display_name चा वापर केला आहे */}
                <h3 style={workerTitle}>
                  {booking.display_name || booking.worker_name || `Worker: ${booking.worker_phone}`}
                </h3>

                <div style={locationRow}>
                  <span style={iconSpan}>📍</span> {booking.work_location}
                </div>
                <div style={dateRow}>
                  <span style={iconSpan}>🗓️</span> 
                  {new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} 
                  <span style={{margin: "0 8px", color: "#cbd5e1"}}>|</span>
                  <span style={iconSpan}>⏰</span> {booking.booking_time}
                </div>
              </div>

              <div style={actionSection}>
                {booking.status === "Accepted" && (
                   <a href={`tel:${booking.worker_phone}`} style={callButtonStyle}>📞 Call Worker</a>
                )}
                {booking.status === "Pending" && (
                  <button 
                    onClick={() => handleCancel(booking.id)} 
                    style={cancelLinkStyle}
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={emptyCard}>
            <div style={emptyIcon}>📅</div>
            <h3 style={{ color: "#1e293b", marginBottom: "8px" }}>एकही बुकिंग सापडली नाही</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              सध्या तुमच्याकडे कोणतीही सक्रिय सेवा नाही.
            </p>
            <button onClick={() => navigate("/workers")} style={browseButtonStyle}>
              Find a Professional
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle = { padding: "40px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const titleStyle = { fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-1.5px" };
const subTitleStyle = { fontSize: "15px", color: "#64748b", fontWeight: "600", marginTop: "4px" };
const addButtonStyle = { background: "#2563eb", color: "#fff", border: "none", padding: "14px 24px", borderRadius: "16px", fontWeight: "800", cursor: "pointer", fontSize: "14px", boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)", transition: "0.3s" };
const listStyle = { display: "flex", flexDirection: "column", gap: "20px" };
const glassCardStyle = { display: "flex", background: "#fff", border: "2px solid #f1f5f9", borderRadius: "28px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", cursor: "default" };
const statusSection = { display: "flex", flexDirection: "column", alignItems: "center", marginRight: "20px" };
const iconBox = (status) => ({ width: "52px", height: "52px", borderRadius: "18px", background: status === "Accepted" ? "#dcfce7" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "12px" });
const verticalLine = { width: "2px", flex: 1, background: "#f1f5f9", borderRadius: "2px" };
const infoSection = { flex: 1 };
const topRow = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" };
const orderIdText = { fontSize: "11px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase" };
const badgeStyle = (status) => ({ fontSize: "10px", fontWeight: "900", padding: "5px 12px", borderRadius: "20px", background: status === "Accepted" ? "#dcfce7" : "#fef3c7", color: status === "Accepted" ? "#16a34a" : "#d97706", textTransform: "uppercase" });
const workerTitle = { fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0" };
const locationRow = { fontSize: "14px", color: "#475569", fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center" };
const dateRow = { fontSize: "14px", color: "#64748b", fontWeight: "500", display: "flex", alignItems: "center" };
const iconSpan = { marginRight: "10px", fontSize: "18px" };
const actionSection = { display: "flex", flexDirection: "column", justifyContent: "center", gap: "15px", marginLeft: "20px" };
const callButtonStyle = { background: "#2563eb", color: "#fff", padding: "12px 20px", borderRadius: "14px", textDecoration: "none", fontSize: "13px", fontWeight: "800", textAlign: "center", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" };
const cancelLinkStyle = { background: "none", border: "none", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer", opacity: "0.7", transition: "0.2s", textDecoration: "underline" };
const emptyCard = { textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "40px", border: "2px dashed #e2e8f0" };
const emptyIcon = { fontSize: "70px", marginBottom: "20px" };
const browseButtonStyle = { background: "#0f172a", color: "white", border: "none", padding: "16px 36px", borderRadius: "18px", fontWeight: "800", cursor: "pointer", marginTop: "15px" };
const loaderStyle = { textAlign: "center", padding: "100px 0", color: "#64748b", fontWeight: "700", fontSize: "18px" };

export default MyBookings;