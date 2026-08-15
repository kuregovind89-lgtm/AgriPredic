import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/theme.css";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import History from "./pages/History";
import WeatherRisk from "./pages/WeatherRisk";
import MarketPrice from "./pages/MarketPrice";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import LiveDetect from "./pages/LiveDetect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/weather" element={<ProtectedRoute><WeatherRisk /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><MarketPrice /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      <Route
        path="/livedetect"
        element={
          <ProtectedRoute>
            <LiveDetect />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
