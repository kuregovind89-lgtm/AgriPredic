import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiPlantSeed } from "react-icons/gi";
import api from "../api/api";
import { PlantGrowthIllustration } from "../components/Illustrations";
//import {mysql.connector };

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      //mysql=mysql.connector.connect(mysql+pymysql://root:@localhost:3307/agripredic)
    


      await api.post("/api/auth/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-illustration-panel tilt-3d">
          <PlantGrowthIllustration style={{ width: "100%", maxWidth: 320 }} />
          <h2>Join Thousands of Farmers</h2>
          <p>Track crop health, get instant diagnoses, and grow with confidence.</p>
        </div>
        <div className="glass-card auth-card animate-in">
        <div className="auth-brand">
          <GiPlantSeed size={40} color="var(--brand-leaf)" />
          <h1>AgriPredic</h1>
        </div>
        <p className="auth-subtitle">Create your farmer account</p>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">Account created! Redirecting to login...</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full Name</label>
          <input name="name" required placeholder="Your name" value={form.name} onChange={handleChange} />
          <label>Email</label>
          <input name="email" type="email" required placeholder="farmer@example.com" value={form.email} onChange={handleChange} />
          <label>Phone</label>
          <input name="phone" placeholder="+91" value={form.phone} onChange={handleChange} />
          <label>Farm Location</label>
          <input name="location" placeholder="" value={form.location} onChange={handleChange} />
          <label>Password</label>
          <input name="password" type="password" required placeholder="••••••••" value={form.password} onChange={handleChange} />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        </div>
      </div>
    </div>
  );
}
