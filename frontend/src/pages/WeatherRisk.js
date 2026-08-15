import React, { useState } from "react";
import { FiCloudRain, FiThermometer, FiDroplet } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Loader from "../components/Loader";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function WeatherRisk() {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.location || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkRisk = async (e) => {
    e.preventDefault();
    if (!location) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/weather/risk", { params: { location } });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not fetch weather data for that location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Weather-Based Disease Risk" subtitle="Fungal outbreaks are strongly linked to humidity & temperature" />

        <div className="glass-card animate-in weather-search">
          <form onSubmit={checkRisk} className="weather-form">
            <input
              placeholder="Enter city/village name (e.g. Pune)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Checking..." : "Check Risk"}
            </button>
          </form>
          {error && <div className="alert-error">{error}</div>}
        </div>

        {loading && <Loader text="Fetching live weather data..." />}

        {result && (
          <div className="weather-results animate-in">
            <div className={`glass-card risk-banner risk-${result.risk_level.toLowerCase()}`}>
              <FiCloudRain size={30} />
              <div>
                <h2>{result.risk_level} Disease Risk</h2>
                <p>{result.risk_reason}</p>
              </div>
            </div>

            <div className="stat-grid">
              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: "var(--brand-blue)" }}><FiThermometer color="#fff" /></div>
                <div>
                  <div className="stat-value">{result.temperature ?? "-"}°C</div>
                  <div className="stat-label">Temperature</div>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: "var(--brand-leaf)" }}><FiDroplet color="#fff" /></div>
                <div>
                  <div className="stat-value">{result.humidity ?? "-"}%</div>
                  <div className="stat-label">Humidity</div>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: "var(--brand-clay)" }}><FiCloudRain color="#fff" /></div>
                <div>
                  <div className="stat-value">{result.rainfall ?? "0"} mm</div>
                  <div className="stat-label">Recent Rainfall</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
