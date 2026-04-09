import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Sync with the centralized key used in your bookings utility
    const data = JSON.parse(localStorage.getItem("workforce_bookings")) || [];
    setBookings(data);
  }, []);

  const cancelBooking = (index) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const updatedBookings = bookings.filter((_, i) => i !== index);
      setBookings(updatedBookings);
      localStorage.setItem("workforce_bookings", JSON.stringify(updatedBookings));
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={headerFlexStyle}>
          <h1 style={titleStyle}>My Bookings</h1>
          {bookings.length > 0 && (
            <Link to="/workers" style={addLinkStyle}>
              + Book Another Professional
            </Link>
          )}
        </div>

        {bookings.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: "50px", marginBottom: "20px" }}>🗓️</div>
            <h2 style={{ color: "#1e293b", marginBottom: "10px" }}>No bookings found</h2>
            <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "25px" }}>
              You haven't booked any services yet.
            </p>
            <Link to="/workers" style={findWorkerBtnStyle}>
              Find Workers
            </Link>
          </div>
        ) : (
          <div style={gridStyle}>
            {bookings.map((booking, index) => (
              <div key={index} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div>
                    <h2 style={workerNameStyle}>{booking.workerName}</h2>
                    <span style={professionStyle}>{booking.profession}</span>
                  </div>
                  <span style={statusBadgeStyle}>Confirmed</span>
                </div>

                <hr style={dividerStyle} />

                <div style={detailsColumnStyle}>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>Date</span>
                    <span style={detailValueStyle}>{booking.date}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>Time</span>
                    <span style={detailValueStyle}>{booking.time}</span>
                  </div>
                  <div style={priceRowStyle}>
                    <span style={{ color: "#1e293b", fontWeight: "700" }}>Total Price</span>
                    <span style={priceValueStyle}>₹{booking.price}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button style={detailsBtnStyle}>View Details</button>
                  <button 
                    onClick={() => cancelBooking(index)} 
                    style={cancelBtnStyle}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = { padding: "40px 50px", backgroundColor: "#f8fafc", minHeight: "90vh", fontFamily: "'Inter', sans-serif" };
const headerFlexStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const titleStyle = { color: "#1e293b", margin: 0, fontSize: "28px", fontWeight: "800" };
const addLinkStyle = { color: "#2563eb", textDecoration: "none", fontWeight: "600", fontSize: "14px" };
const emptyStateStyle = { textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
const findWorkerBtnStyle = { backgroundColor: "#2563eb", color: "white", padding: "12px 25px", borderRadius: "8px", textDecoration: "none", fontWeight: "700" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" };
const cardStyle = { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", position: "relative" };
const cardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" };
const workerNameStyle = { margin: 0, fontSize: "18px", color: "#1e40af", fontWeight: "700" };
const professionStyle = { fontSize: "13px", color: "#64748b", fontWeight: "500" };
const statusBadgeStyle = { backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" };
const dividerStyle = { border: "0", borderTop: "1px solid #f1f5f9", margin: "15px 0" };
const detailsColumnStyle = { display: "flex", flexDirection: "column", gap: "10px" };
const detailRowStyle = { display: "flex", justifyContent: "space-between" };
const detailLabelStyle = { color: "#94a3b8", fontSize: "14px" };
const detailValueStyle = { color: "#334155", fontSize: "14px", fontWeight: "600" };
const priceRowStyle = { display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #e2e8f0" };
const priceValueStyle = { color: "#f97316", fontWeight: "800", fontSize: "18px" };
const detailsBtnStyle = { flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", color: "#475569", fontWeight: "600", cursor: "pointer", fontSize: "14px" };
const cancelBtnStyle = { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #fee2e2", backgroundColor: "#fef2f2", color: "#dc2626", fontWeight: "600", cursor: "pointer", fontSize: "14px" };

export default Dashboard;