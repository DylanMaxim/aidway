"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const CampMap = dynamic(() => import("./CampMap"), { ssr: false });

export default function CharityPage() {
  const [charityName, setCharityName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [copied, setCopied] = useState(false);

  const [generatedCode, setGeneratedCode] = useState("");
  const [campId, setCampId] = useState("");
  const [summaryResponse, setSummaryResponse] = useState(null);
  const [predictionCampId, setPredictionCampId] = useState("");
  const [predictionResponse, setPredictionResponse] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [campMapData, setCampMapData] = useState(null);

  function handleLogin(event) {
    event.preventDefault();
    if (charityName.trim() && password.trim()) {
      setIsLoggedIn(true);
    }
  }

  function generateCampAccessCode() {
    const value = Math.floor(Math.random() * 0xffffff);
    const code = value.toString(16).toUpperCase().padStart(6, "0");
    setGeneratedCode(code);
    setCampId(code);
    setCopied(false);
  }

  function copyCode() {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSummaryFetch(event) {
    event.preventDefault();

    const res = await fetch(`/api/camp-summary?campId=${encodeURIComponent(campId)}`);
    const data = await res.json();
    setSummaryResponse(data);
  }

  async function handlePredictionFetch(event) {
    event.preventDefault();

    const res = await fetch(
      `/api/predict-pad-demand?campId=${encodeURIComponent(predictionCampId)}`
    );
    const data = await res.json();
    setPredictionResponse(data);
  }

  async function handleHeatmapLoad() {
    const res = await fetch("/api/heatmap-data");
    const data = await res.json();
    setHeatmapData(data);
  }

  async function handleCampMapLoad() {
    const res = await fetch("/api/camp-map-data");
    const data = await res.json();
    setCampMapData(data);
  }

  function getHeatmapColor(count) {
    if (count >= 11) return "#ef4444";
    if (count >= 6) return "#fb923c";
    if (count >= 3) return "#fdba74";
    if (count >= 1) return "#fef3c7";
    return "#f9fafb";
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f5f5",
      color: "#1f2937",
      padding: "32px 16px",
      fontFamily: "Arial, sans-serif"
    },
    container: {
      maxWidth: 720,
      margin: "0 auto"
    },
    title: {
      margin: "0 0 20px 0",
      fontSize: 30,
      lineHeight: 1.2
    },
    card: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 20,
      marginBottom: 16
    },
    sectionTitle: {
      margin: "0 0 14px 0",
      fontSize: 22
    },
    field: {
      marginBottom: 14
    },
    label: {
      display: "block",
      marginBottom: 6,
      fontSize: 14,
      fontWeight: 600
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      fontSize: 15
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
      cursor: "pointer"
    },
    codeBox: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 8,
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: "0.05em"
    },
    responseLabel: {
      margin: "0 0 8px 0",
      fontSize: 16
    },
    responseBox: {
      padding: 12,
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      overflowX: "auto"
    },
    tableWrap: {
      overflowX: "auto",
      marginTop: 12
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 760
    },
    th: {
      border: "1px solid #d1d5db",
      textAlign: "left",
      padding: "8px 10px",
      background: "#f3f4f6",
      fontSize: 13
    },
    td: {
      border: "1px solid #d1d5db",
      padding: "8px 10px",
      fontSize: 13
    },
    legend: {
      marginTop: 10,
      fontSize: 13,
      color: "#374151"
    },
    mapFrame: {
      marginTop: 12,
      borderRadius: 10,
      border: "1px solid #d1d5db",
      overflow: "hidden"
    },
    pre: {
      margin: 0,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 13
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Charity Test Page</h1>

        {!isLoggedIn ? (
          <div style={styles.card}>
            <form onSubmit={handleLogin}>
              <h2 style={styles.sectionTitle}>Charity Login</h2>

              <div style={styles.field}>
                <label style={styles.label}>Charity Name</label>
                <input
                  style={styles.input}
                  value={charityName}
                  onChange={(e) => setCharityName(e.target.value)}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button style={styles.button} type="submit">
                Login
              </button>
            </form>
          </div>
        ) : (
          <>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Generate Camp Access Code</h2>
              <button style={styles.button} type="button" onClick={generateCampAccessCode}>
                Generate Camp Access Code
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <div style={{ ...styles.codeBox, marginTop: 0, flex: 1 }}>
                  {generatedCode || "No code generated yet"}
                </div>
                {generatedCode && (
                  <button
                    type="button"
                    onClick={copyCode}
                    style={{
                      background: copied ? "#166534" : "#ffffff",
                      color: copied ? "#ffffff" : "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </div>

            <div style={styles.card}>
              <form onSubmit={handleSummaryFetch}>
                <h2 style={styles.sectionTitle}>Camp Summary Lookup</h2>
                <div style={styles.field}>
                  <label style={styles.label}>Camp ID</label>
                  <input
                    style={styles.input}
                    value={campId}
                    onChange={(e) => setCampId(e.target.value)}
                  />
                </div>
                <button style={styles.button} type="submit">
                  Fetch Summary
                </button>
              </form>

              <div style={{ marginTop: 16 }}>
                <h3 style={styles.responseLabel}>Summary Response</h3>
                <div style={styles.responseBox}>
                  <pre style={styles.pre}>{JSON.stringify(summaryResponse, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <form onSubmit={handlePredictionFetch}>
                <h2 style={styles.sectionTitle}>Pad Demand Prediction</h2>
                <div style={styles.field}>
                  <label style={styles.label}>Camp ID</label>
                  <input
                    style={styles.input}
                    value={predictionCampId}
                    onChange={(e) => setPredictionCampId(e.target.value)}
                  />
                </div>
                <button style={styles.button} type="submit">
                  Predict Next Month Pad Demand
                </button>
              </form>

              <div style={{ marginTop: 16 }}>
                <h3 style={styles.responseLabel}>Prediction Response</h3>
                <div style={styles.responseBox}>
                  <pre style={styles.pre}>{JSON.stringify(predictionResponse, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Demand Heatmap</h2>
              <button style={styles.button} type="button" onClick={handleHeatmapLoad}>
                Load Heatmap
              </button>

              <div style={styles.legend}>
                0 = none | 1-2 = low | 3-5 = medium | 6-10 = high | 11+ = critical
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Camp ID</th>
                      {(heatmapData?.catalogItems || []).map((item) => (
                        <th key={item} style={styles.th}>
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(heatmapData?.rows || []).map((row) => (
                      <tr key={row.campId}>
                        <td style={styles.td}>{row.campId}</td>
                        {(heatmapData?.catalogItems || []).map((item) => {
                          const value = row.counts?.[item] ?? 0;
                          return (
                            <td
                              key={`${row.campId}-${item}`}
                              style={{ ...styles.td, background: getHeatmapColor(value) }}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16 }}>
                <h3 style={styles.responseLabel}>Heatmap Response</h3>
                <div style={styles.responseBox}>
                  <pre style={styles.pre}>{JSON.stringify(heatmapData, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Camp Map</h2>
              <p style={{ marginTop: 0, fontSize: 13, color: "#4b5563" }}>
                Demo-only synthetic pinpoints for visualization.
              </p>
              <button style={styles.button} type="button" onClick={handleCampMapLoad}>
                Load Camp Map
              </button>

              <div style={styles.mapFrame}>
                <CampMap camps={campMapData?.camps || []} />
              </div>

              <div style={{ marginTop: 16 }}>
                <h3 style={styles.responseLabel}>Camp Map Response</h3>
                <div style={styles.responseBox}>
                  <pre style={styles.pre}>{JSON.stringify(campMapData, null, 2)}</pre>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
