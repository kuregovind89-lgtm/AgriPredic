import React, { useEffect, useState } from "react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Loader from "../components/Loader";
import api from "../api/api";

const TREND_ICON = {
  up: <FiTrendingUp color="var(--brand-leaf)" />,
  down: <FiTrendingDown color="var(--brand-red)" />,
  stable: <FiMinus color="var(--text-muted)" />,
};

export default function MarketPrice() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/market/prices").then((res) => setPrices(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Market Price Information" subtitle="Latest mandi prices to help you decide when to sell" />

        {loading ? <Loader text="Loading market prices..." /> : (
          <div className="market-grid">
            {prices.map((p, idx) => (
              <div className="glass-card market-card animate-in" key={idx}>
                <div className="market-header">
                  <h4>{p.crop}</h4>
                  {TREND_ICON[p.trend]}
                </div>
                <p className="market-market">{p.market}</p>
                <div className="market-price">₹{p.price_per_quintal.toLocaleString()} <span>/quintal</span></div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
