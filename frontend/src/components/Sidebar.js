import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome, FiUploadCloud, FiClock, FiCloudRain, FiDollarSign,
  FiShield, FiLogOut,
  FiCamera,
} from "react-icons/fi";
import { GiPlantSeed } from "react-icons/gi";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `sidebar-link${isActive ? " active" : ""}`;

  return (
    <aside className="sidebar glass-card">
      <div className="sidebar-brand">
        <GiPlantSeed size={28} className="leaf-icon" color="var(--brand-leaf)" />
        <span>AgriPredic</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}><FiHome /> Dashboard</NavLink>
        <NavLink to="/upload" className={linkClass}><FiUploadCloud /> Detect Disease</NavLink>
        <NavLink to="/history" className={linkClass}><FiClock /> Crop History</NavLink>
        <NavLink to="/weather" className={linkClass}><FiCloudRain /> Weather Risk</NavLink>
        <NavLink to="/market" className={linkClass}><FiDollarSign /> Market Prices</NavLink>
        <NavLink to="/livedetect" className={linkClass}><FiCamera /> Live Detect</NavLink>
        {isAdmin && <NavLink to="/admin" className={linkClass}><FiShield /> Admin Panel</NavLink>}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn-secondary logout-btn" onClick={logout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}
