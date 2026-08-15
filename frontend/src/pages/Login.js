import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiPlantSeed } from "react-icons/gi";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { FarmSceneIllustration } from "../components/Illustrations";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      login(res.data.user, res.data.access_token);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-illustration-panel tilt-3d">
          <FarmSceneIllustration style={{ width: "100%", maxWidth: 420 }} />
          <h2>Grow Smarter, Not Harder</h2>
          <p>AI-powered disease detection and risk prediction, built for every farmer.</p>
        </div>
        <div className="glass-card auth-card animate-in">
        <div className="auth-brand">
          <GiPlantSeed size={40} color="var(--brand-leaf)" />
          <h1>AgriPredic</h1>
        </div>
        <p className="auth-subtitle">Sign in to check your crop's health</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email" required placeholder="farmer@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label>Password</label>
          <input
            type="password" required placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          New to AgriPredic? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-hint">
          
        </p>
        </div>
      </div>
    </div>
  );
}
