"use client";

import { useMemo, useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState<string>("");
  const [maxViews, setMaxViews] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const payload = useMemo(() => {
    const p: any = { content };
    if (ttl.trim() !== "") p.ttl_seconds = Number(ttl);
    if (maxViews.trim() !== "") p.max_views = Number(maxViews);
    return p;
  }, [content, ttl, maxViews]);

  async function onCreate() {
    setError("");
    setResultUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        return;
      }

      setResultUrl(data.url);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      padding: "48px 16px",
      background: "#0b0b0d",
      color: "#f5f5f7",
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    },
    card: {
      maxWidth: 860,
      margin: "0 auto",
      background: "#111114",
      border: "1px solid #232327",
      borderRadius: 16,
      padding: 20,
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    },
    title: { fontSize: 28, fontWeight: 700, margin: 0 },
    subtitle: { marginTop: 6, marginBottom: 18, color: "#b8b8c2" },

    label: {
      display: "block",
      fontSize: 14,
      color: "#cfcfda",
      marginBottom: 8,
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #2a2a30",
      background: "#0f0f12",
      color: "#f5f5f7",
      outline: "none",
    },
    textarea: {
      width: "100%",
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid #2a2a30",
      background: "#0f0f12",
      color: "#f5f5f7",
      outline: "none",
      resize: "vertical",
      minHeight: 180,
      lineHeight: 1.4,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginTop: 14,
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
      flexWrap: "wrap",
    },
    button: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #2a2a30",
      background: "#1a1a20",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600,
    },
    hint: { color: "#9a9aa6", fontSize: 13, margin: 0 },
    error: {
      marginTop: 14,
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #402026",
      background: "#1a0f12",
      color: "#ffd3d8",
    },
    success: {
      marginTop: 14,
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #1f3b2a",
      background: "#0f1712",
      color: "#c9f2d6",
      wordBreak: "break-word",
    },
    link: { color: "#9ecbff" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pastebin-Lite</h1>
        <p style={styles.subtitle}>
          Create a paste and share a link. Optional TTL + view limits.
        </p>

        <div>
          <label style={styles.label}>Content *</label>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write anything…"
          />
        </div>

        <div style={styles.grid}>
          <div>
            <label style={styles.label}>TTL seconds (optional)</label>
            <input
              style={styles.input}
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              type="number"
              min={1}
              placeholder="e.g. 60"
            />
          </div>

          <div>
            <label style={styles.label}>Max views (optional)</label>
            <input
              style={styles.input}
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              type="number"
              min={1}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button
            onClick={onCreate}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Creating…" : "Create paste"}
          </button>
          <p style={styles.hint}>
            API: <code>/api/pastes</code> · View: <code>/p/:id</code>
          </p>
        </div>

        {error && <div style={styles.error}>Error: {error}</div>}

        {resultUrl && (
          <div style={styles.success}>
            Share URL:{" "}
            <a
              style={styles.link}
              href={resultUrl}
              target="_blank"
              rel="noreferrer"
            >
              {resultUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
