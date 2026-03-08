"use client";

import { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";

export default function AdminDashboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [accessCode, setAccessCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [campUrl, setCampUrl] = useState("");

  useEffect(() => {
    if (isLoggedIn && typeof window !== "undefined") {
      const code = accessCode.trim().toUpperCase();
      setCampUrl(`${window.location.origin}/test/camp?code=${encodeURIComponent(code)}`);
    }
  }, [isLoggedIn, accessCode]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (accessCode.trim()) {
      setIsLoggedIn(true);
      setQrGenerated(false);
    }
  }

  async function generateQR() {
    if (!canvasRef.current || !campUrl) return;
    await QRCode.toCanvas(canvasRef.current, campUrl, { width: 200, margin: 2 });
    setQrGenerated(true);
  }

  function downloadQR() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `camp-${accessCode.trim().toUpperCase()}-qr.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#f5f5f5",
      color: "#1f2937",
      padding: "32px 16px",
      fontFamily: "Arial, sans-serif",
    },
    container: { maxWidth: 720, margin: "0 auto" },
    title: { margin: "0 0 20px 0", fontSize: 30, lineHeight: 1.2 },
    card: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 20,
      marginBottom: 16,
    },
    sectionTitle: { margin: "0 0 14px 0", fontSize: 22 },
    field: { marginBottom: 14 },
    label: { display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      fontSize: 15,
    },
    button: {
      width: "100%",
      background: "#111827",
      color: "#ffffff",
      border: "none",
      borderRadius: 8,
      padding: "11px 14px",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      marginBottom: 10,
    },
    buttonOutline: {
      width: "100%",
      background: "#ffffff",
      color: "#111827",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      padding: "11px 14px",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
    },
    codeBox: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 8,
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      fontSize: 14,
    },
    activeCode: {
      margin: "0 0 14px 0",
      padding: "8px 10px",
      borderRadius: 8,
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      fontSize: 14,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        {/* Step 1: Access code login */}
        {!isLoggedIn ? (
          <div style={styles.card}>
            <form onSubmit={handleLogin}>
              <h2 style={styles.sectionTitle}>Camp Access</h2>
              <div style={styles.field}>
                <label style={styles.label}>Camp Access Code</label>
                <input
                  style={styles.input}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. CAMP01"
                />
              </div>
              <button style={styles.button} type="submit">
                Continue
              </button>
            </form>
          </div>
        ) : (
          <>
            <p style={styles.activeCode}>
              Active camp code: <strong>{accessCode.trim().toUpperCase()}</strong>
              {" — "}
              <span
                style={{ cursor: "pointer", textDecoration: "underline", fontSize: 13 }}
                onClick={() => { setIsLoggedIn(false); setQrGenerated(false); }}
              >
                Switch camp
              </span>
            </p>

            {/* QR Code card */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Generate Camp Form QR Code</h2>
              <p style={{ margin: "0 0 14px 0", fontSize: 14, color: "#4b5563" }}>
                Generate a QR code that links residents directly to the form pre-loaded with camp code <strong>{accessCode.trim().toUpperCase()}</strong>. Submissions will be stored under this camp.
              </p>

              <button style={styles.button} onClick={generateQR}>
                Generate QR Code
              </button>

              {qrGenerated && (
                <button style={styles.buttonOutline} onClick={downloadQR}>
                  Download QR Code (PNG)
                </button>
              )}

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    display: qrGenerated ? "block" : "none",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                {!qrGenerated && (
                  <div style={{ ...styles.codeBox, color: "#9ca3af" }}>
                    No QR code generated yet
                  </div>
                )}
                {qrGenerated && campUrl && (
                  <div style={styles.codeBox}>
                    Links to: <strong>{campUrl}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Chatbot card */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>AI Health Assistant</h2>
              <p style={{ margin: "0 0 14px 0", fontSize: 14, color: "#4b5563" }}>
                Open the AI chatbot to help collect detailed product needs through a guided conversation.
              </p>
              <a href="/chatbot" style={{ textDecoration: "none" }}>
                <button style={styles.button}>Go to Chatbot</button>
              </a>
            </div>

            {/* Direct form link */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Open Camp Form</h2>
              <p style={{ margin: "0 0 14px 0", fontSize: 14, color: "#4b5563" }}>
                Open the form directly, pre-loaded with camp code <strong>{accessCode.trim().toUpperCase()}</strong>.
              </p>
              <a href={`/test/camp?code=${encodeURIComponent(accessCode.trim().toUpperCase())}`} style={{ textDecoration: "none" }}>
                <button style={styles.buttonOutline}>Open Camp Form</button>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}