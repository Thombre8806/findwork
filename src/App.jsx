import React, { useEffect } from "react"; // 👈 useEffect ॲड केला
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client"; // 👈 Socket.io इम्पोर्ट केले

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Workers from "./pages/Workers";
import Booking from "./pages/Booking"; 
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import MyBookings from "./pages/MyBookings";
import MyTasks from "./pages/MyTasks";
import AdminDashboard from "./pages/AdminDashboard"; 
import Navbar from "./components/Navbar";

// --- Socket Connection Setup ---
// तुझ्या सर्व्हरचा URL (Backend Port 5000)
const socket = io("http://localhost:5000"); 

// 🛡️ Protected Route Component (तुझा मूळ कोड)
const ProtectedRoute = ({ children, allowedRole, blockRole }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (blockRole && userRole === blockRole.toLowerCase()) {
    return <Navigate to="/profile" replace />;
  }

  if (allowedRole && userRole !== allowedRole.toLowerCase() && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();

  // --- 🛰️ Real-time Online Tracking Logic ---
  useEffect(() => {
    // समजा तू sessionStorage मध्ये युजरचा फोन नंबर साठवला असेल
    const userPhone = sessionStorage.getItem("userPhone"); 

    if (userPhone) {
      // सर्व्हरला सांगा: "मी ऑनलाईन आहे!"
      socket.emit('user_online', userPhone);
    }

    // टॅब बंद झाल्यावर किंवा कंपोनेंट अनमाउंट झाल्यावर डिस्कनेक्ट करा
    return () => {
      socket.disconnect();
    };
  }, [location.pathname]); // पाथ बदलला की पुन्हा चेक करेल

  const hideNavbarPaths = ["/settings", "/admin"]; 
  const showNavbar = !hideNavbarPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {showNavbar && <Navbar />}
      
      <div className="content">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/workers" element={<Workers />} />
          
          {/* --- Shared Private Routes --- */}
          <Route path="/profile" element={
            <ProtectedRoute> 
              <Profile /> 
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute> 
              <Settings /> 
            </ProtectedRoute>
          } />

          {/* --- Client-Only Routes --- */}
          <Route path="/booking" element={
            <ProtectedRoute allowedRole="client">
              <Booking />
            </ProtectedRoute>
          } />
          
          <Route path="/my-bookings" element={
            <ProtectedRoute allowedRole="client"> 
              <MyBookings /> 
            </ProtectedRoute>
          } />
          
          {/* --- Specialist-Only Routes --- */}
          <Route path="/my-tasks" element={
            <ProtectedRoute allowedRole="specialist"> 
              <MyTasks /> 
            </ProtectedRoute>
          } />

          {/* --- Admin-Only Route --- */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin"> 
              <AdminDashboard /> 
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;