import React from "react";

export default function StatCard({ icon, label, value, accent }) {
  return (
    <div className="glass-card stat-card animate-in">
      <div className="stat-icon" style={{ background: accent }}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
