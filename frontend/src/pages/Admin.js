import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import { FiUsers, FiActivity, FiFileText } from "react-icons/fi";
import api from "../api/api";

const TABS = ["Analytics", "Users", "Diseases", "Predictions"];

export default function Admin() {
  const [tab, setTab] = useState("Analytics");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [a, u, d, p] = await Promise.all([
      api.get("/api/admin/analytics"),
      api.get("/api/admin/users"),
      api.get("/api/admin/diseases"),
      api.get("/api/admin/predictions"),
    ]);
    setAnalytics(a.data);
    setUsers(u.data);
    setDiseases(d.data);
    setPredictions(p.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const toggleUser = async (id) => {
    await api.put(`/api/admin/users/${id}/toggle`);
    loadAll();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Remove this user?")) return;
    await api.delete(`/api/admin/users/${id}`);
    loadAll();
  };

  const deleteDisease = async (id) => {
    if (!window.confirm("Remove this disease entry?")) return;
    await api.delete(`/api/admin/diseases/${id}`);
    loadAll();
  };

  const diseaseChartData = analytics
    ? Object.entries(analytics.disease_breakdown).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Admin Panel" subtitle="Manage users, diseases and monitor platform activity" />

        <div className="tab-bar">
          {TABS.map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {loading ? <Loader text="Loading admin data..." /> : (
          <>
            {tab === "Analytics" && analytics && (
              <>
                <div className="stat-grid">
                  <StatCard icon={<FiUsers color="#fff" />} label="Total Farmers" value={analytics.total_users} accent="var(--brand-leaf)" />
                  <StatCard icon={<FiActivity color="#fff" />} label="Total Scans" value={analytics.total_predictions} accent="var(--brand-blue)" />
                  <StatCard icon={<FiFileText color="#fff" />} label="Diseases Tracked" value={diseases.length} accent="var(--brand-clay)" />
                </div>
                <div className="glass-card chart-card animate-in">
                  <h3>Disease Frequency</h3>
                  {diseaseChartData.length ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={diseaseChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={80} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--brand-leaf)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="empty-hint">No prediction data yet.</p>}
                </div>
              </>
            )}

            {tab === "Users" && (
              <div className="glass-card animate-in table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                        <td><span className={`badge ${u.is_active ? "badge-low" : "badge-high"}`}>{u.is_active ? "Active" : "Disabled"}</span></td>
                        <td>
                          <button className="btn-secondary sm-btn" onClick={() => toggleUser(u.id)}>Toggle</button>
                          <button className="btn-secondary sm-btn danger" onClick={() => deleteUser(u.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "Diseases" && (
              <div className="glass-card animate-in table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Crop</th><th>Default Severity</th><th>Actions</th></tr></thead>
                  <tbody>
                    {diseases.map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td><td>{d.crop}</td>
                        <td><span className={`badge badge-${d.severity_default.toLowerCase()}`}>{d.severity_default}</span></td>
                        <td><button className="btn-secondary sm-btn danger" onClick={() => deleteDisease(d.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "Predictions" && (
              <div className="glass-card animate-in table-card">
                <table className="admin-table">
                  <thead><tr><th>Disease</th><th>Crop</th><th>Confidence</th><th>Severity</th><th>Date</th></tr></thead>
                  <tbody>
                    {predictions.map((p) => (
                      <tr key={p.id}>
                        <td>{p.disease_name}</td><td>{p.crop}</td><td>{p.confidence}%</td>
                        <td><span className={`badge badge-${p.severity.toLowerCase()}`}>{p.severity}</span></td>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
