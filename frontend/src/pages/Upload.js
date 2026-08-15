import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Loader from "../components/Loader";
import { LeafScanIllustration } from "../components/Illustrations";
import api from "../api/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en"); // "en" | "mr"

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/api/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;
    try {
      const res = await api.get(`/api/predict/${result.id}/report`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `AgriPredic_Report_${result.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Could not download report.");
    }
  };

  const severityClass = result ? `badge badge-${result.severity.toLowerCase()}` : "";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Detect Crop Disease" subtitle="Upload a clear photo of the affected leaf" />

        <div className="upload-grid">
          <div className="glass-card upload-card animate-in">
            <label htmlFor="fileInput" className="upload-dropzone">
              {preview ? (
                <img src={preview} alt="preview" className="upload-preview" />
              ) : (
                <>
                  <LeafScanIllustration style={{ width: 140, height: 140 }} />
                  <p>Click to select a leaf image (JPG / PNG)</p>
                </>
              )}
            </label>
            <input id="fileInput" type="file" accept="image/jpeg,image/png" hidden onChange={handleFileChange} />
            <button className="btn-primary" onClick={handleUpload} disabled={!file || loading}>
              {loading ? "Analyzing..." : "Analyze Leaf"}
            </button>
            {error && <div className="alert-error">{error}</div>}
          </div>

          <div className="glass-card result-card animate-in">
            <div className="result-header-row">
              <h3>Diagnosis Result</h3>
              {result && (
                <div className="lang-toggle">
                  <button className={lang === "en" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("en")}>English</button>
                  <button className={lang === "mr" ? "lang-btn active" : "lang-btn"} onClick={() => setLang("mr")}>मराठी</button>
                </div>
              )}
            </div>
            {loading && <Loader text="Running AI diagnosis..." />}
            {!loading && !result && <p className="empty-hint">Your results will appear here after analysis.</p>}
            {result && (
              <div className="result-body">
                <div className="result-row">
                  <span className="result-label">{lang === "mr" ? "रोग" : "Disease"}</span>
                  <span className="result-value">{lang === "mr" ? (result.disease_name_mr || result.disease_name) : result.disease_name}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">{lang === "mr" ? "पीक" : "Crop"}</span>
                  <span className="result-value">{result.crop}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">{lang === "mr" ? "विश्वासार्हता" : "Confidence"}</span>
                  <span className="result-value">{result.confidence}%</span>
                </div>
                <div className="result-row">
                  <span className="result-label">{lang === "mr" ? "तीव्रता" : "Severity"}</span>
                  <span className={severityClass}>{result.severity}</span>
                </div>

                <div className="advice-block">
                  <h4>🩺 {lang === "mr" ? "उपचार" : "Treatment"}</h4>
                  <p>{lang === "mr" ? (result.treatment_mr || result.treatment) : result.treatment}</p>
                </div>
                <div className="advice-block">
                  <h4>🌱 {lang === "mr" ? "खत शिफारस" : "Fertilizer Recommendation"}</h4>
                  <p>{lang === "mr" ? (result.fertilizer_mr || result.fertilizer) : result.fertilizer}</p>
                </div>
                <div className="advice-block">
                  <h4>🛡️ {lang === "mr" ? "प्रतिबंध टिप्स" : "Prevention Tips"}</h4>
                  <p>{lang === "mr" ? (result.prevention_mr || result.prevention) : result.prevention}</p>
                </div>

                <button className="btn-secondary" onClick={downloadReport}>
                  <FiDownload /> Download PDF Report
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
