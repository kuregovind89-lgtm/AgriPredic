import React, { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import api from "../api/api";

const POLL_INTERVAL_MS = 15000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState(null);
  const seenIds = useRef(new Set());
  const firstLoad = useRef(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications/");
      const data = res.data;

      if (!firstLoad.current) {
        const fresh = data.filter((n) => !seenIds.current.has(n.id));
        if (fresh.length > 0) {
          setToast(fresh[0]);
          setTimeout(() => setToast(null), 6000);
        }
      }
      data.forEach((n) => seenIds.current.add(n.id));
      firstLoad.current = false;

      setItems(data);
      setUnread(data.filter((n) => !n.is_read).length);
    } catch {
      // silently ignore poll failures (e.g. logged out)
    }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const markAllRead = async () => {
    await api.put("/api/notifications/read-all");
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const markOneRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="notif-wrap">
      <button className="icon-toggle" onClick={() => setOpen((o) => !o)} title="Notifications">
        <FiBell />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown glass-card">
          <div className="notif-dropdown-head">
            <span>Notifications</span>
            {unread > 0 && <button onClick={markAllRead} className="notif-mark-all">Mark all read</button>}
          </div>
          <div className="notif-list">
            {items.length === 0 && <p className="empty-hint" style={{ padding: "20px 10px" }}>No notifications yet.</p>}
            {items.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.is_read ? "" : "unread"}`}
                onClick={() => !n.is_read && markOneRead(n.id)}
              >
                <div className="notif-item-title">{n.type === "alert" ? "⚠️ " : "ℹ️ "}{n.title}</div>
                <div className="notif-item-msg">{n.message}</div>
                <div className="notif-item-time">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="notif-toast glass-card">
          <div className="notif-toast-title">⚠️ {toast.title}</div>
          <div className="notif-toast-msg">{toast.message}</div>
        </div>
      )}
    </div>
  );
}
