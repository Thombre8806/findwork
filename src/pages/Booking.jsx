import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css"; 

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const worker = location.state?.worker || null;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationAddress, setLocationAddress] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!worker) {
      const timer = setTimeout(() => navigate("/workers"), 3000);
      return () => clearTimeout(timer);
    }
  }, [worker, navigate]);

  if (!worker) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2 style={{ color: "#ef4444" }}>No Professional Selected!</h2>
        <p>Redirecting you to the experts list...</p>
      </div>
    );
  }

  const handleBooking = async () => {
    const userPhone = sessionStorage.getItem("userPhone");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      alert("Please login first to confirm your booking.");
      navigate("/login");
      return;
    }

    if (!date || !time || !locationAddress) {
      alert("Please provide the Date, Time, and Work Location.");
      return;
    }

    setIsSubmitting(true);

    // ✅ पेलोडमध्ये worker_name ॲड केला आहे जो बॅकएंडला हवा आहे
    const payload = {
      client_phone: userPhone,
      worker_phone: worker.phone, 
      worker_name: worker.full_name || worker.name, // बॅकएंडसाठी नाव पाठवणे अनिवार्य आहे
      work_location: locationAddress,
      booking_date: date,
      booking_time: time
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/book-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        alert(`Success! 🎉 Appointment with ${worker.full_name || worker.name} is confirmed.`);
        navigate("/my-bookings");
      } else {
        // जर बॅकएंडने एरर दिला तर तो इथे दिसेल (उदा. "सर्व माहिती भरणे आवश्यक आहे")
        alert("Booking Error: " + result.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Could not connect to server. Check your backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "600px", marginTop: "50px" }}>
      <div style={checkoutCard}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>Confirm Booking</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Review details and pick a slot</p>
        </div>

        <div style={summaryBox}>
          <div style={avatarStyle}>{worker.image || "👤"}</div>
          <div>
            <h3 style={{ margin: 0 }}>{worker.full_name || worker.name}</h3>
            <span style={badgeStyle}>{worker.trade || worker.skill || "Professional"}</span>
            <p style={{ margin: "5px 0 0 0", fontWeight: "bold", color: "#2563eb" }}>
              Experience: {worker.experience_years} Years
            </p>
          </div>
        </div>

        <hr style={{ border: "0", borderTop: "1px solid #e2e8f0", margin: "25px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Work Location 📍</label>
            <input 
              type="text" 
              placeholder="Enter full address for the service"
              style={inputOverride}
              onChange={(e) => setLocationAddress(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Service Date</label>
              <input 
                type="date" 
                style={inputOverride}
                min={new Date().toISOString().split("T")[0]} 
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Preferred Time</label>
              <input 
                type="time" 
                style={inputOverride}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleBooking} 
            disabled={isSubmitting}
            style={{ 
              ...bookBtnStyle,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer" 
            }}
          >
            {isSubmitting ? "Confirming..." : "Confirm Appointment"}
          </button>
          
          <button onClick={() => navigate("/workers")} style={backBtn}>
            Cancel and Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const checkoutCard = { background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9" };
const headerStyle = { marginBottom: "30px", borderLeft: "5px solid #2563eb", paddingLeft: "15px" };
const summaryBox = { display: "flex", alignItems: "center", gap: "20px", background: "#f8fafc", padding: "20px", borderRadius: "16px" };
const avatarStyle = { width: "70px", height: "70px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", border: "3px solid white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const badgeStyle = { fontSize: "11px", background: "#dbeafe", color: "#1e40af", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", textTransform: "uppercase" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" };
const inputOverride = { width: "100%", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0", boxSizing: "border-box" };
const bookBtnStyle = { padding: "16px", fontSize: "1.1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold" };
const backBtn = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginTop: "10px", textDecoration: "underline" };

export default Booking;