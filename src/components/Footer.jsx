import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

function Footer() {
  const footerLinkStyle = { listStyle: "none", padding: 0 };
  const textMuted = { color: "#94a3b8", fontSize: "0.9rem" };
  const headingStyle = { color: "white", marginBottom: "20px" };

  return (
    <footer className="main-footer">
      <div className="nav-container footer-grid">
        
        {/* Brand Section */}
        <div className="footer-brand">
          <Link to="/" className="nav-logo" style={{ color: "white" }}>
            <div className="logo-icon">W</div>
            <span>Workforce<span className="logo-accent">Connect</span></span>
          </Link>
          <p style={{ ...textMuted, marginTop: "15px" }}>
            Connecting skilled professionals with households across the city. 
            Reliable, fast, and trusted services.
          </p>
        </div>

        {/* Navigation */}
        <div className="footer-links">
          <h4 style={headingStyle}>Quick Links</h4>
          <ul style={footerLinkStyle}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/workers">Find Workers</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-links">
          <h4 style={headingStyle}>Popular Services</h4>
          <ul style={footerLinkStyle}>
            <li><Link to="/workers">Plumbing</Link></li>
            <li><Link to="/workers">Electrical</Link></li>
            <li><Link to="/workers">Painting</Link></li>
            <li><Link to="/workers">Cleaning</Link></li>
          </ul>
        </div>

        {/* Contact Details */}
        <div className="footer-contact">
          <h4 style={headingStyle}>Contact Us</h4>
          <p style={{ ...textMuted, marginBottom: "10px" }}>📍 Pune, Maharashtra, India</p>
          <p style={{ ...textMuted, marginBottom: "10px" }}>📞 +91 98765 43210</p>
          <p style={textMuted}>📧 support@workforce.com</p>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="nav-container" style={{ justifyContent: "center", borderTop: "1px solid #334155", paddingTop: "20px", marginTop: "40px" }}>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            © 2026 WorkforceConnect. All rights reserved. Made in India.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;