"use client";

import { useEffect, useState } from "react";

export default function CampLandingPage() {
    const [code, setCode] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const c = params.get("code");
        if (c) setCode(c.toUpperCase());
    }, []);

    const formUrl = code
        ? `/test/camp?code=${encodeURIComponent(code)}`
        : "/test/camp";

    const chatbotUrl = code
        ? `/chatbot?code=${encodeURIComponent(code)}`
        : "/chatbot";

    const styles: Record<string, React.CSSProperties> = {
        page: {
            minHeight: "100vh",
            background: "#f5f5f5",
            color: "#1f2937",
            padding: "32px 16px",
            fontFamily: "Arial, sans-serif",
        },
        container: { maxWidth: 720, margin: "0 auto" },
        title: { margin: "0 0 8px 0", fontSize: 30, lineHeight: 1.2 },
        subtitle: { margin: "0 0 24px 0", fontSize: 14, color: "#4b5563" },
        card: {
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 20,
            marginBottom: 16,
        },
        sectionTitle: { margin: "0 0 8px 0", fontSize: 22 },
        desc: { margin: "0 0 14px 0", fontSize: 14, color: "#4b5563" },
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
            textDecoration: "none",
            display: "block",
            textAlign: "center" as const,
            boxSizing: "border-box" as const,
        },
        divider: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "4px 0",
        },
        dividerLine: { flex: 1, border: "none", borderTop: "1px solid #e5e7eb" },
        dividerText: { fontSize: 13, color: "#9ca3af" },
        codeTag: {
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 6,
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 700,
        },
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.title}>Submit a Request</h1>
                {code && (
                    <p style={styles.subtitle}>
                        Camp code: <span style={styles.codeTag}>{code}</span>
                    </p>
                )}

                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>💬 Chat with AI Assistant</h2>
                    <p style={styles.desc}>
                        Answer a few questions in a guided conversation. The AI will help collect your needs.
                    </p>
                    <a href={chatbotUrl} style={styles.button}>
                        Open AI Assistant
                    </a>
                </div>

                <div style={styles.divider}>
                    <hr style={styles.dividerLine} />
                    <span style={styles.dividerText}>or</span>
                    <hr style={styles.dividerLine} />
                </div>

                <div style={{ ...styles.card, marginTop: 16 }}>
                    <h2 style={styles.sectionTitle}>📋 Fill in the Form</h2>
                    <p style={styles.desc}>
                        Type or speak your request details directly into the form.
                    </p>
                    <a href={formUrl} style={styles.button}>
                        Open Form
                    </a>
                </div>
            </div>
        </div>
    );
}
