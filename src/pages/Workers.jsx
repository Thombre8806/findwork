import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Workers() {
  const [filter, setFilter] = useState("All");
  const [workers, setWorkers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [selectedWorker, setSelectedWorker] = useState(null); 
  const [bookingData, setBookingData] = useState({ date: "", time: "", location: "" });
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const userPhone = sessionStorage.getItem("userPhone");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/workers");
        const result = await response.json();
        if (result.success) {
          setWorkers(result.workers);
        }
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const handleBookNowClick = (worker) => {
    setSelectedWorker(worker);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !userPhone) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    
    // ✅ UPDATE: worker_name पेलोडमध्ये ॲड केला आहे (बॅकएंडसाठी आवश्यक)
    const payload = {
      client_phone: userPhone,
      worker_phone: selectedWorker.phone,
      worker_name: selectedWorker.full_name, // हे नाव बॅकएंडमध्ये सेव्ह होईल
      work_location: bookingData.location,
      booking_date: bookingData.date,
      booking_time: bookingData.time,
      status: "Pending"
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/book-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        alert(`Success! 🎉 ${selectedWorker.full_name} has been booked.`);
        setSelectedWorker(null);
        setBookingData({ date: "", time: "", location: "" });
        navigate("/my-bookings");
      } else {
        alert("Booking Failed: " + (result.error || "Server Error"));
      }
    } catch (error) {
      alert("Server connection failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWorkers = filter === "All" 
    ? workers 
    : workers.filter(w => w.trade === filter);

  const getIcon = (trade) => {
    const icons = { 
      Plumber: "🔧", 
      Electrician: "⚡", 
      Cleaner: "🧹", 
      Carpenter: "🪚",
      Painter: "🎨",
      "AC Repair": "❄️"
    };
    return icons[trade] || "👤";
  };

  return (
    <div style={pageContainer}>
      <div style={headerSection}>
        <h2 style={titleStyle}>Choose Our Professional Workers 🛠️</h2>
        <div style={filterContainer}>
          {["All", "Plumber", "Electrician", "Cleaner", "Carpenter", "Painter"].map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)} 
              style={filterBtnStyle(filter === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={gridStyle}>
        {loading ? (
           <div style={loadingContainer}>
             <h3>Finding Experts for you... ⏳</h3>
           </div>
        ) : filteredWorkers.length > 0 ? (
          filteredWorkers.map(worker => (
            <div 
              key={worker.phone} 
              style={cardStyle}
              className="worker-card"
            >
              <div style={avatarStyle}>{getIcon(worker.trade)}</div>
              <h3 style={workerNameStyle}>{worker.full_name}</h3>
              <p style={skillStyle}>{worker.trade}</p>
              
              <div style={statsContainer}>
                <span style={statBadge}>⭐ 4.8</span> 
                <span style={statBadge}>💼 {worker.experience_years || 0} Yrs Exp</span>
              </div>
              
              <div style={footerStyle}>
                <span style={priceStyle}>₹300<small>/hr</small></span>
                
                {isLoggedIn ? (
                  <button style={bookBtnStyle} onClick={() => handleBookNowClick(worker)}>
                    Book Now
                  </button>
                ) : (
                  <button style={loginToBookBtnStyle} onClick={() => navigate("/login")}>
                    Login to Book
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={emptyContainer}>
            <p>No workers found in "{filter}" category.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedWorker && (
        <div style={modalOverlay}>
            <div style={modalContent}>
              <div style={modalHeader}>
                  <h3 style={{margin:0, fontWeight: "900"}}>Book {selectedWorker.full_name}</h3>
                  <button onClick={() => setSelectedWorker(null)} style={closeBtnStyle}>✕</button>
              </div>
              <form onSubmit={handleBookingSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Work Location 📍</label>
                  <input 
                    type="text" 
                    placeholder="Enter full address" 
                    required 
                    style={inputStyle} 
                    value={bookingData.location} 
                    onChange={(e) => setBookingData({...bookingData, location: e.target.value})} 
                  />
                </div>
                <div style={{display: "flex", gap: "10px"}}>
                  <div style={{flex: 1}}>
                     <label style={labelStyle}>Date</label>
                     <input type="date" required min={today} style={inputStyle} value={bookingData.date} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
                  </div>
                  <div style={{flex: 1}}>
                     <label style={labelStyle}>Time</label>
                     <input type="time" required style={inputStyle} value={bookingData.time} onChange={(e) => setBookingData({...bookingData, time: e.target.value})} />
                  </div>
                </div>
                <button type="submit" style={confirmBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Confirming..." : "Confirm Appointment"}
                </button>
              </form>
            </div>
        </div>
      )}
    </div>
  );
}

// --- Styles (प्रोफेशनल लूकसाठी थोडे अपडेट्स) ---
const pageContainer = { padding: "60px 5%", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const headerSection = { textAlign: "center", marginBottom: "50px" };
const titleStyle = { fontSize: "36px", color: "#0f172a", fontWeight: "900", letterSpacing: "-1px" };
const filterContainer = { marginTop: "25px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "30px", maxWidth: "1200px", margin: "0 auto" };

const cardStyle = { 
  background: "white", padding: "30px", borderRadius: "24px", 
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", 
  textAlign: "center", transition: "transform 0.3s ease", cursor: "default" 
};

const avatarStyle = { 
  width: "80px", height: "80px", background: "#f1f5f9", borderRadius: "24px", 
  display: "flex", alignItems: "center", justifyContent: "center", 
  fontSize: "36px", margin: "0 auto 20px auto"
};

const workerNameStyle = { margin: "0 0 5px 0", color: "#1e293b", fontSize: "22px", fontWeight: "800" };
const skillStyle = { color: "#2563eb", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", background: "#eff6ff", padding: "4px 12px", borderRadius: "20px", display: "inline-block" };
const statsContainer = { display: "flex", justifyContent: "center", gap: "15px", marginTop: "20px" };
const statBadge = { fontSize: "13px", color: "#64748b", background: "#f8fafc", padding: "6px 12px", borderRadius: "10px", fontWeight: "600" };

const footerStyle = { borderTop: "1px solid #f1f5f9", marginTop: "25px", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const priceStyle = { fontWeight: "900", color: "#0f172a", fontSize: "20px" };
const bookBtnStyle = { background: "#2563eb", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" };
const loginToBookBtnStyle = { background: "#f1f5f9", color: "#64748b", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" };

const filterBtnStyle = (isActive) => ({ 
  padding: "10px 24px", borderRadius: "14px", border: "none", cursor: "pointer", 
  backgroundColor: isActive ? "#2563eb" : "white", color: isActive ? "white" : "#64748b", 
  fontWeight: "700", boxShadow: isActive ? "0 10px 15px -3px rgba(37, 99, 235, 0.25)" : "0 4px 6px rgba(0,0,0,0.02)",
  transition: "0.3s"
});

const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContent = { background: "white", padding: "40px", borderRadius: "32px", width: "95%", maxWidth: "420px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" };
const closeBtnStyle = { border: "none", background: "#f1f5f9", width: "35px", height: "35px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" };
const inputGroup = { textAlign: "left" };
const inputStyle = { width: "100%", padding: "14px", marginTop: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", boxSizing: "border-box", fontSize: "15px", backgroundColor: "#f8fafc" };
const labelStyle = { fontSize: "14px", fontWeight: "800", color: "#475569", marginLeft: "4px" };
const confirmBtn = { width: "100%", background: "#2563eb", color: "white", border: "none", padding: "16px", borderRadius: "14px", fontWeight: "800", cursor: "pointer", fontSize: "16px", marginTop: "10px" };

const loadingContainer = { gridColumn: "1/-1", textAlign: "center", padding: "100px 0" };
const emptyContainer = { gridColumn: "1/-1", textAlign: "center", padding: "60px", background: "white", borderRadius: "24px" };

export default Workers;