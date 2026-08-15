import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Loader from "../components/Loader";
import { EmptyStateIllustration } from "../components/Illustrations";
import api, { API_ORIGIN } from "../api/api";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    api.get("/api/history/").then((res) => setRecords(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Crop Health History" subtitle="All your past disease scans in one place" />

        {records.length > 0 && (
          <div className="lang-toggle" style={{ marginBottom: 16, width: "fit-content" }}>
            <button className={lang === "en" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("en")}>English</button>
            <button className={lang === "mr" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("mr")}>मराठी</button>
          </div>
        )}

        {loading ? <Loader text="Loading history..." /> : (
          records.length === 0 ? (
            <div className="glass-card animate-in empty-state">
              <EmptyStateIllustration style={{ width: 180, height: 145 }} />
              <p>No scans yet. Head to "Detect Disease" to analyze your first leaf image.</p>
            </div>
          ) : (
            <div className="history-grid">
              {records.map((r) => (
                <div className="glass-card history-card animate-in" key={r.id}>
                  <img src={`${API_ORIGIN}${r.image_path}`} alt={r.disease_name} className="history-thumb" />
                  <div className="history-info">
                    <h4>{lang === "mr" ? (r.disease_name_mr || r.disease_name) : r.disease_name}</h4>
                    <p className="history-meta">{r.crop} • {new Date(r.created_at).toLocaleDateString()}</p>
                    <span className={`badge badge-${r.severity.toLowerCase()}`}>{r.severity}</span>
                    <span className="confidence-tag">{r.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
