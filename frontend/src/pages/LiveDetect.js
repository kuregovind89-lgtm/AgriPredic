import React, { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const API_URL = "http://127.0.0.1:8000/predict";

// Normalizes different possible backend field names into one shape
function normalizeResult(raw) {
  if (!raw || typeof raw !== "object") return null;

  const disease =
    raw.disease ??
    raw.prediction ??
    raw.class_name ??
    raw.predicted_class ??
    raw.label ??
    "Unknown";

  const crop = raw.crop ?? raw.crop_name ?? "Unknown";

  let confidence = raw.confidence ?? raw.probability ?? raw.accuracy ?? null;
  if (typeof confidence === "number" && confidence <= 1) {
    confidence = Math.round(confidence * 1000) / 10; // 0.953 -> 95.3
  } else if (typeof confidence === "number") {
    confidence = Math.round(confidence * 10) / 10;
  }

  const severity = raw.severity ?? raw.risk_level ?? raw.risk ?? "N/A";
  const symptoms = raw.symptoms ?? raw.symptom ?? "";
  const treatment = raw.treatment ?? raw.treatment_advice ?? "";
  const prevention = raw.prevention ?? raw.prevention_tips ?? "";

  return { disease, crop, confidence, severity, symptoms, treatment, prevention };
}

export default function LiveDetect() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // dataURL for preview
  const [capturedBlob, setCapturedBlob] = useState(null); // blob for upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Ensure camera is stopped on unmount
  useEffect(() => {
    return () => {
      stopCameraTracks();
    };
  }, [stopCameraTracks]);

  const openCamera = async () => {
    setError("");
    setResult(null);
    setCapturedImage(null);
    setCapturedBlob(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      // Video element mounts on next render; attach stream after that
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (err) {
      console.error("Camera error:", err);
      if (err && err.name === "NotAllowedError") {
        setError("Camera permission was denied. Please allow camera access and try again.");
      } else if (err && err.name === "NotFoundError") {
        setError("No camera device was found on this device.");
      } else {
        setError("Unable to access camera. Please check permissions and try again.");
      }
      setCameraOpen(false);
    }
  };

  const closeCamera = () => {
    stopCameraTracks();
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    setError("");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to capture photo. Please try again.");
          return;
        }
        setCapturedBlob(blob);
        setCapturedImage(URL.createObjectURL(blob));
        stopCameraTracks();
        setCameraOpen(false);
      },
      "image/jpeg",
      0.92
    );
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setResult(null);
    setError("");
    openCamera();
  };

  const detectDisease = async () => {
    if (!capturedBlob) {
      setError("Please capture a photo first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", capturedBlob, "crop-image.jpg");

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const normalized = normalizeResult(data);

      if (!normalized) {
        throw new Error("Received an unexpected response from the server.");
      }

      setResult(normalized);
    } catch (err) {
      console.error("Detection error:", err);
      setError(
        "Could not analyze the image. Please make sure the backend server is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layoutRoot}>
      <style>{`
        .ld-main { flex: 1 1 0%; min-width: 0; min-height: 100vh; box-sizing: border-box; }
        @media (max-width: 900px) {
          .ld-layout { flex-direction: column; }
          .ld-main { width: 100%; }
        }
        @media (max-width: 768px) {
          .ld-content-inner { padding: 16px !important; }
          .ld-video, .ld-preview-img { max-width: 100% !important; }
          .ld-title { font-size: 22px !important; }
        }
        .ld-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="ld-layout" style={styles.layoutFlex}>
        <div style={styles.sidebarWrap}>
          <Sidebar />
        </div>

        <div className="ld-main">
          <Topbar />

          <div className="ld-content-inner" style={styles.inner}>
            <div style={styles.badge}>AI Computer Vision Engine</div>
            <h1 className="ld-title" style={styles.title}>Live Crop Detection</h1>
            <p style={styles.subtitle}>
              Capture a clear photo of your crop leaf to instantly detect diseases using AI.
            </p>

          <div style={styles.card}>
            {error && <div style={styles.errorBox}>{error}</div>}

            {/* State 1: idle, nothing open, nothing captured */}
            {!cameraOpen && !capturedImage && (
              <div style={styles.centerCol}>
                <div style={styles.iconCircle}>📷</div>
                <h2 style={styles.readyTitle}>Ready to Scan</h2>
                <p style={styles.readyText}>
                  Position your camera in good natural lighting facing the infected area of the crop leaf.
                </p>
                <button className="ld-btn" style={styles.primaryBtn} onClick={openCamera}>
                  📹 Open Live Camera
                </button>
              </div>
            )}

            {/* State 2: camera open, live preview */}
            {cameraOpen && (
              <div style={styles.centerCol}>
                <video
                  className="ld-video"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={styles.video}
                />
                <div style={styles.btnRow}>
                  <button className="ld-btn" style={styles.primaryBtn} onClick={capturePhoto}>
                    Capture Photo
                  </button>
                  <button className="ld-btn" style={styles.secondaryBtn} onClick={closeCamera}>
                    Close Camera
                  </button>
                </div>
              </div>
            )}

            {/* State 3: photo captured, awaiting detection */}
            {!cameraOpen && capturedImage && (
              <div style={styles.centerCol}>
                <img
                  className="ld-preview-img"
                  src={capturedImage}
                  alt="Captured crop"
                  style={styles.previewImg}
                />
                <div style={styles.btnRow}>
                  <button
                    className="ld-btn"
                    style={styles.secondaryBtn}
                    onClick={retakePhoto}
                    disabled={loading}
                  >
                    Retake Photo
                  </button>
                  <button
                    className="ld-btn"
                    style={styles.primaryBtn}
                    onClick={detectDisease}
                    disabled={loading}
                  >
                    {loading ? "Analyzing..." : "Detect Disease"}
                  </button>
                </div>

                {loading && (
                  <div style={styles.loadingRow}>
                    <div style={styles.spinner} />
                    <span>Analyzing image, please wait...</span>
                  </div>
                )}
              </div>
            )}

            {/* Hidden canvas used for capturing frames */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          {/* Result panel */}
          {result && (
            <div style={styles.resultCard}>
              <h3 style={styles.resultTitle}>Detection Result</h3>
              <div style={styles.resultGrid}>
                <ResultRow label="Crop" value={result.crop} />
                <ResultRow label="Disease" value={result.disease} />
                <ResultRow
                  label="Confidence"
                  value={result.confidence !== null ? `${result.confidence}%` : "N/A"}
                />
                <ResultRow label="Severity" value={result.severity} />
              </div>
              {result.symptoms && (
                <ResultBlock label="Symptoms" value={result.symptoms} />
              )}
              {result.treatment && (
                <ResultBlock label="Treatment" value={result.treatment} />
              )}
              {result.prevention && (
                <ResultBlock label="Prevention" value={result.prevention} />
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div style={styles.resultRow}>
      <span style={styles.resultLabel}>{label}</span>
      <span style={styles.resultValue}>{value}</span>
    </div>
  );
}

function ResultBlock({ label, value }) {
  return (
    <div style={styles.resultBlock}>
      <div style={styles.resultLabel}>{label}</div>
      <div style={styles.resultBlockText}>{value}</div>
    </div>
  );
}

const GREEN = "#1f7a3f";
const GREEN_DARK = "#155c2e";
const GREEN_LIGHT = "#e6f4ea";

const styles = {
  layoutRoot: {
    width: "100%",
    minHeight: "100vh",
    background: "#f7f8f5",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  layoutFlex: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    minHeight: "100vh",
  },
  sidebarWrap: {
    flexShrink: 0,
  },
  inner: {
    padding: "32px 40px",
    maxWidth: 900,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  badge: {
    display: "inline-block",
    background: GREEN_LIGHT,
    color: GREEN,
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#555",
    marginBottom: 24,
    fontSize: 15,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7e0",
    borderRadius: 14,
    padding: 32,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    boxSizing: "border-box",
    width: "100%",
  },
  centerCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: GREEN_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    marginBottom: 8,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  },
  readyText: {
    color: "#666",
    fontSize: 14,
    maxWidth: 420,
    marginBottom: 8,
  },
  primaryBtn: {
    background: GREEN,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px 22px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#fff",
    color: GREEN_DARK,
    border: `1px solid ${GREEN}`,
    borderRadius: 8,
    padding: "12px 22px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 12,
  },
  video: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 12,
    background: "#000",
  },
  previewImg: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 12,
    border: "1px solid #e5e7e0",
  },
  errorBox: {
    background: "#fdecec",
    color: "#a11313",
    border: "1px solid #f5c2c2",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 16,
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#555",
    fontSize: 14,
    marginTop: 12,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid #d5d5d5",
    borderTopColor: GREEN,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  resultCard: {
    background: "#ffffff",
    border: "1px solid #e5e7e0",
    borderRadius: 14,
    padding: 28,
    marginTop: 24,
    boxSizing: "border-box",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
    marginTop: 0,
    marginBottom: 16,
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 12,
  },
  resultRow: {
    display: "flex",
    flexDirection: "column",
    background: GREEN_LIGHT,
    borderRadius: 8,
    padding: "10px 14px",
  },
  resultLabel: {
    fontSize: 12,
    color: GREEN_DARK,
    fontWeight: 600,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: 600,
  },
  resultBlock: {
    marginTop: 12,
  },
  resultBlockText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 1.5,
    marginTop: 4,
  },
};