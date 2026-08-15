import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import VoiceAssistant from "./VoiceAssistant";
import NotificationBell from "./NotificationBell";

export default function Topbar({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        <VoiceAssistant />
        <NotificationBell />
        <button className="icon-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
          {theme === "light" ? <FiMoon /> : <FiSun />}
        </button>
      </div>
    </div>
  );
}
