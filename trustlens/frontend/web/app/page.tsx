"use client";

import { useState } from "react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const getRiskColor = (risk: string) => {
    if (risk === "HIGH RISK") return "#dc2626";
    if (risk === "SUSPICIOUS") return "#d97706";
    return "#16a34a";
  };

  const analyze = async () => {
    if ((email && message) || (email && url) || (message && url)) {
      setError("❌ Please use only ONE input at a time");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const payload: any = {};
    if (email) payload.job_text = "Email: " + email;
    if (message) payload.job_text = message;
    if (url) payload.url = url;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "auto",
          background: "white",
          padding: 30,
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ShieldCheckIcon width={34} height={34} color="#4f46e5" />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000" }}>
            TrustLens
          </h1>
        </div>

        {/* SUBTITLE (FIXED COLOR) */}
        <p style={{ color: "#374151", marginTop: 4 }}>
          Smart scam detection for job links, messages, and emails
        </p>

        {/* EMAIL */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste email here..."
          style={{
            marginTop: 20,
            width: "100%",
            padding: 14,
            border: "1px solid #d1d5db",
            borderRadius: 12,
          }}
        />

        <p style={{ textAlign: "center", margin: 10, color: "#6b7280" }}>OR</p>

        {/* MESSAGE */}
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste job message..."
          style={{
            width: "100%",
            padding: 14,
            border: "1px solid #d1d5db",
            borderRadius: 12,
          }}
        />

        <p style={{ textAlign: "center", margin: 10, color: "#6b7280" }}>OR</p>

        {/* LINK */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste job link (LinkedIn, Naukri, etc.)"
          style={{
            width: "100%",
            padding: 14,
            border: "1px solid #d1d5db",
            borderRadius: 12,
          }}
        />

        {/* BUTTON */}
        <button
          onClick={analyze}
          disabled={loading}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 14,
            fontSize: 16,
            fontWeight: 600,
            color: "white",
            background: "#4f46e5",
            borderRadius: 14,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {/* ERROR */}
        {error && (
          <p style={{ color: "#dc2626", marginTop: 12 }}>{error}</p>
        )}

        {/* RESULT */}
        {result && (
          <div
            style={{
              marginTop: 25,
              padding: 20,
              borderRadius: 16,
              border: `2px solid ${getRiskColor(result.risk_level)}`,
              background: "#fafafa",
              color: "#000",
            }}
          >
            <p style={{ fontWeight: 600, fontSize: 16 }}>
              Trust Score: {result.trust_score}/100
            </p>

            <div
              style={{
                margin: "10px 0",
                width: "100%",
                height: 12,
                background: "#e5e7eb",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${result.trust_score}%`,
                  height: "100%",
                  background: getRiskColor(result.risk_level),
                }}
              />
            </div>

            <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <ExclamationTriangleIcon width={18} />
              <b>Risk Level:</b>
              <span style={{ color: getRiskColor(result.risk_level) }}>
                {result.risk_level}
              </span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
