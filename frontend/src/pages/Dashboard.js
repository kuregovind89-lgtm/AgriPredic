import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FiActivity, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { GiPlantSeed } from "react-icons/gi";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import { EmptyStateIllustration } from "../components/Illustrations";
import Loader from "../components/Loader";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const COLORS = { Low: "#3fa55a", Medium: "#f4b942", High: "#e5533c" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/api/history/stats").then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  const pieData = stats
    ? Object.entries(stats.severity_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title={`Welcome back, ${user?.name?.split(" ")[0] || "Farmer"} 👋`} subtitle="Here's how your crops are doing" />

        {loading ? <Loader text="Loading your dashboard..." /> : (
          <>
            <div className="stat-grid">
              <StatCard icon={<GiPlantSeed color="#fff" />} label="Total Scans" value={stats?.total_scans ?? 0} accent="var(--brand-leaf)" />
              <StatCard icon={<FiCheckCircle color="#fff" />} label="Healthy Cases" value={stats?.severity_breakdown?.Low ?? 0} accent="#3fa55a" />
              <StatCard icon={<FiAlertTriangle color="#fff" />} label="Medium Risk" value={stats?.severity_breakdown?.Medium ?? 0} accent="var(--brand-amber)" />
              <StatCard icon={<FiActivity color="#fff" />} label="High Risk" value={stats?.severity_breakdown?.High ?? 0} accent="var(--brand-red)" />
            </div>

            <div className="dashboard-grid">
              <div className="glass-card chart-card animate-in">
                <h3>Severity Breakdown</h3>
                {stats?.total_scans ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-hint-block">
                    <EmptyStateIllustration style={{ width: 160, height: 130 }} />
                    <p className="empty-hint">No scans yet. Upload a crop leaf image to get started!</p>
                  </div>
                )}
              </div>

              <div className="glass-card animate-in quick-actions">
                <h3>Quick Actions</h3>
                <a href="/upload" className="btn-primary quick-btn">📷 Scan New Leaf</a>
                <a href="/weather" className="btn-secondary quick-btn">🌦️ Check Weather Risk</a>
                <a href="/history" className="btn-secondary quick-btn">📜 View Full History</a>
                <a href="/market" className="btn-secondary quick-btn">💰 Market Prices</a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
