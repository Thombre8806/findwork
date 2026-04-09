import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("client");
  const [userInitial, setUserInitial] = useState("U");
  const location = useLocation();

  // --- 1. Navbar डेटा अपडेट करण्याचे लॉजिक ---
  const updateNavData = () => {
    const loggedInStatus = sessionStorage.getItem("isLoggedIn") === "true";
    const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

    const sessionName = sessionStorage.getItem("userName");
    const localName = localStorage.getItem("userName");
    const userName = sessionName || localName || "User";

    if (loggedInStatus) {
      setIsLoggedIn(true);
      setRole(userRole || "client");
      setUserInitial(userName.trim().charAt(0).toUpperCase());
    } else {
      setIsLoggedIn(false);
      setRole("client");
      setUserInitial("U");
    }
  };

  // --- 2. Heartbeat: बॅकएंडला युजर 'Live' असल्याचे कळवणे ---
  const sendHeartbeat = async () => {
    // sessionStorage मधून युजरचा फोन नंबर घ्या
    const userData = sessionStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.phone) {
          await fetch("http://localhost:5000/api/update-last-seen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: user.phone }),
          });
        }
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    }
  };

  useEffect(() => {
    // सुरुवातीला डेटा लोड करा
    updateNavData();

    // जर युजर लॉग-इन असेल, तर लगेच एकदा Heartbeat पाठवा
    const loggedInStatus = sessionStorage.getItem("isLoggedIn") === "true";
    if (loggedInStatus) {
      sendHeartbeat();
    }

    // दर ४५ सेकंदांनी Heartbeat पाठवा (Real-time Live status साठी)
    const heartbeatInterval = setInterval(() => {
      if (sessionStorage.getItem("isLoggedIn") === "true") {
        sendHeartbeat();
      }
    }, 45000);

    // Listeners: स्टोरेज किंवा प्रोफाईल अपडेट झाल्यावर लगेच बदल दिसण्यासाठी
    // ✅ 'roleUpdated' मुळे स्विच केल्यावर लिंक्स लगेच बदलतील
    window.addEventListener("roleUpdated", updateNavData);
    window.addEventListener("nameUpdated", updateNavData);
    window.addEventListener("storage", updateNavData);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("roleUpdated", updateNavData);
      window.removeEventListener("nameUpdated", updateNavData);
      window.removeEventListener("storage", updateNavData);
    };
  }, [location]);

  // --- Styles ---
  const getActiveStyle = ({ isActive }) => ({
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "700",
    transition: "all 0.3s ease",
    color: isActive ? "#2563eb" : "#475569",
    borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
    paddingBottom: "5px"
  });

  const getProfileIconStyle = ({ isActive }) => ({
    textDecoration: "none",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "16px",
    background: isActive ? "#2563eb" : "#eff6ff",
    color: isActive ? "#ffffff" : "#2563eb",
    border: "1.5px solid #e2e8f0",
  });

  return (
    <nav className="navbar" style={navBarStyle}>
      <Link to="/" style={logoStyle}>
        Workforce<span style={{ color: "#2563eb" }}>Connect</span>
      </Link>

      <div style={linkGroupStyle}>
        <NavLink to="/" style={getActiveStyle}>Home</NavLink>

        {/* Client आणि Admin ला 'Find Workers' दिसेल */}
        {role !== "specialist" && (
          <NavLink to="/workers" style={getActiveStyle}>Find Workers</NavLink>
        )}

        {isLoggedIn ? (
          <>
            {/* ॲडमिनला 'Dashboard' दिसेल */}
            {role === "admin" && (
              <NavLink to="/admin" style={getActiveStyle}>Dashboard</NavLink>
            )}

            {role === "client" && (
              <NavLink to="/my-bookings" style={getActiveStyle}>My Bookings</NavLink>
            )}

            {role === "specialist" && (
              <NavLink to="/my-tasks" style={getActiveStyle}>My Tasks</NavLink>
            )}

            {/* Profile Avatar */}
            <NavLink to="/profile" style={getProfileIconStyle} title="My Profile">
              {userInitial}
            </NavLink>
          </>
        ) : (
          <NavLink to="/login" style={signInBtnStyle}>
            Sign In / Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

// --- Styles ---
const navBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 6%",
  background: "#ffffff",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  borderBottom: "1px solid #f1f5f9"
};

const logoStyle = {
  fontSize: "22px",
  fontWeight: "900",
  textDecoration: "none",
  color: "#0f172a",
  letterSpacing: "-0.5px"
};

const linkGroupStyle = {
  display: "flex",
  gap: "25px",
  alignItems: "center"
};

const signInBtnStyle = {
  textDecoration: "none",
  color: "#ffffff",
  background: "#2563eb",
  fontWeight: "700",
  fontSize: "13px",
  padding: "10px 22px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer"
};

export default Navbar;