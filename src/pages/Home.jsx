import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // API कॉलसाठी

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkers: 0, totalBookings: 0 });
  const [user, setUser] = useState({ isLoggedIn: false, role: "", name: "" });

  useEffect(() => {
    // 1. Session Storage मधून डेटा घेणे (Login पेजवर आपण हेच सेट केलंय)
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const role = sessionStorage.getItem("userRole") || "";
    const name = sessionStorage.getItem("userName") || "";
    setUser({ isLoggedIn: loggedIn, role: role, name: name });

    // 2. Dynamic Stats Fetch करणे (बॅकएंडच्या /api/admin/stats मधून)
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/stats");
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.log("Stats आणताना अडचण आली.");
      }
    };
    fetchStats();
  }, []);

  const categories = [
    { name: "Plumber", icon: "🚰" },
    { name: "Electrician", icon: "⚡" },
    { name: "Cleaner", icon: "🧹" },
    { name: "Carpenter", icon: "🪚" },
    { name: "Painter", icon: "🎨" },
    { name: "AC Repair", icon: "❄️" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // जर युजरने काहीच टाईप केलं नसेल तर फक्त /workers वर नेईल
    navigate(`/workers?query=${searchQuery}&loc=${location}`);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#fff" }}>
      
      {/* --- HERO SECTION --- */}
      <section style={heroSectionStyle}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={heroTitleStyle}>
            {user.isLoggedIn ? `Welcome Back, ${user.name} 👋` : "Find the Perfect "}
            <br />
            <span style={{ color: "#3b82f6" }}>Expert</span> for Your Every Need.
          </h1>
          <p style={heroSubTitleStyle}>
            Connect with {stats.totalWorkers}+ verified local professionals for home services, repairs, and more.
          </p>

          {/* Dynamic Search / CTA based on User Role */}
          {user.role === "specialist" ? (
            <div style={{ marginTop: "30px" }}>
              <button 
                onClick={() => navigate("/my-bookings")} // Specialist साठी bookings Dashboard
                style={primaryBtnStyle}
              >
                View My Work Orders 🛠️
              </button>
            </div>
          ) : (
            <form onSubmit={handleSearch} style={searchBarContainer}>
              <input 
                type="text" 
                placeholder="Ex: Plumber, Electrician..." 
                style={inputStyle}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Your City" 
                style={{ ...inputStyle, flex: 1 }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button type="submit" style={searchBtnStyle}>Search</button>
            </form>
          )}

          {/* Stats Section (Dynamic) */}
          <div style={statsContainer}>
            <div style={statItem}><b>{stats.totalWorkers}+</b><br/>Verified Pros</div>
            <div style={statItem}><b>{stats.totalBookings}+</b><br/>Jobs Completed</div>
            <div style={statItem}><b>24/7</b><br/>Support</div>
          </div>
        </div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section style={{ padding: "80px 20px", textAlign: "center", background: "#f8fafc" }}>
        <h2 style={sectionTitle}>Explore Top Categories</h2>
        <div style={categoryGrid}>
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              onClick={() => navigate(`/workers?cat=${cat.name}`)}
              style={categoryCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.02)";
              }}
            >
              <div style={iconBox}>{cat.icon}</div>
              <span style={{ fontWeight: "700", color: "#1e293b" }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2 style={sectionTitle}>How WorkforceConnect Works</h2>
        <div style={stepsGrid}>
          <div style={stepCard}>
            <div style={stepCircle}>1</div>
            <h3 style={{fontWeight: "800", color: "#1e293b"}}>Post a Request</h3>
            <p style={{color: "#64748b"}}>Tell us what you need, from minor repairs to major renovations.</p>
          </div>
          <div style={stepCard}>
            <div style={stepCircle}>2</div>
            <h3 style={{fontWeight: "800", color: "#1e293b"}}>Choose your Pro</h3>
            <p style={{color: "#64748b"}}>Compare profiles, ratings, and previous work to find the best fit.</p>
          </div>
          <div style={stepCard}>
            <div style={stepCircle}>3</div>
            <h3 style={{fontWeight: "800", color: "#1e293b"}}>Get it Done</h3>
            <p style={{color: "#64748b"}}>Sit back and relax while our expert handles the job perfectly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Styles (Same as yours, with minor cleanups) ---
const heroSectionStyle = {
  padding: "120px 0 100px 0",
  textAlign: "center",
  background: "#0f172a",
  color: "white",
  backgroundImage: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)",
};

const heroTitleStyle = { fontSize: "clamp(36px, 6vw, 56px)", fontWeight: "900", marginBottom: "20px", lineHeight: "1.2", letterSpacing: "-1.5px" };
const heroSubTitleStyle = { fontSize: "clamp(16px, 2vw, 18px)", color: "#94a3b8", marginBottom: "45px", maxWidth: "600px", margin: "0 auto 45px auto" };

const searchBarContainer = {
  display: "flex", flexWrap: "wrap", maxWidth: "800px", margin: "0 auto",
  background: "white", padding: "10px", borderRadius: "15px", gap: "10px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

const inputStyle = { flex: 2, padding: "15px", border: "1px solid #e2e8f0", borderRadius: "10px", outline: "none", fontSize: "16px", color: "#1e293b" };
const searchBtnStyle = { backgroundColor: "#2563eb", color: "white", border: "none", padding: "15px 40px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "16px" };
const primaryBtnStyle = { backgroundColor: "#2563eb", color: "white", border: "none", padding: "18px 45px", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "18px", boxShadow: "0 10px 20px rgba(37,99,235,0.3)" };

const statsContainer = { display: "flex", justifyContent: "center", gap: "50px", marginTop: "60px" };
const statItem = { fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5" };

const sectionTitle = { fontSize: "32px", fontWeight: "800", color: "#1e293b", marginBottom: "40px" };
const categoryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "25px", maxWidth: "1100px", margin: "0 auto" };
const categoryCard = { padding: "30px", background: "white", borderRadius: "20px", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" };
const iconBox = { fontSize: "40px", marginBottom: "15px", background: "#f8fafc", width: "80px", height: "80px", lineHeight: "80px", borderRadius: "50%", margin: "0 auto 15px auto" };

const stepsGrid = { display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "center", maxWidth: "1200px", margin: "0 auto" };
const stepCard = { flex: "1 1 300px", textAlign: "center", padding: "20px" };
const stepCircle = { width: "55px", height: "55px", background: "#2563eb", color: "white", borderRadius: "50%", lineHeight: "55px", fontSize: "22px", fontWeight: "900", margin: "0 auto 25px auto" };

export default Home;