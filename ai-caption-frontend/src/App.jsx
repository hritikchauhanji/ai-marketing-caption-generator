import React, { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function formatCaption(caption) {
  if (!caption) return null;
  // Remove hash (#) and asterisk (*) at the start of lines
  const lines = caption
    .split("\n")
    .map((line) =>
      line
        .replace(/^(\s*[#*]+)\s*/, "") // Remove starting # or * (heading/list)
        .replace(/^[-•·]\s*/, "") // Remove starting bullet markers - • ·
        .trim()
    )
    .filter(Boolean);

  if (lines.length === 0) return null;

  let formatted = [];
  // If first line is a heading (all caps or title-looking), treat as heading
  if (lines.length > 1 && /^[A-Z\s!?.:'",0-9]+$/.test(lines[0])) {
    formatted.push(
      <h2 key="header" className="text-xl font-bold text-slate-800 mb-2">
        {lines[0]}
      </h2>
    );
    lines.shift();
  }

  // Build formatted output: paragraphs and points (split points on . or ; for clarity)
  lines.forEach((line, idx) => {
    // If line looks like a bullet (short and comma/dot separated or starts with "- " but was already cleaned)
    if (
      line.length < 80 &&
      (line.includes(";") ||
        line.includes("•") ||
        (line.includes(".") && !line.endsWith(".")))
    ) {
      // Split on separators and show as bullets
      let points = line
        .split(/[;•.]/)
        .map((pt) => pt.trim())
        .filter(Boolean);
      formatted.push(
        <ul key={`ul-${idx}`} className="list-disc ml-6 mb-2 text-slate-700">
          {points.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
      );
    } else {
      formatted.push(
        <p key={`p-${idx}`} className="mb-2 text-slate-700">
          {line}
        </p>
      );
    }
  });
  return formatted;
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCaption = async () => {
    setLoading(true);
    setCaption("");
    setError("");
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        throw new Error("Server returned error");
      }
      const data = await res.json();
      setCaption(data.caption ?? "No caption generated.");
    } catch (err) {
      setError("Failed to generate caption.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full bg-white p-10 rounded-3xl shadow-2xl border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-7 text-center tracking-tight">
          AI Social Caption Generator{" "}
          <span className="text-slate-500">(Gemini)</span>
        </h1>
        <textarea
          className="w-full p-3 border border-slate-300 rounded-xl mb-5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none h-24"
          rows={4}
          placeholder="Describe your promo, product, or campaign idea…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold text-lg hover:bg-slate-800 transition disabled:opacity-50"
          onClick={generateCaption}
          disabled={loading || !prompt}
        >
          {loading ? "Generating..." : "Generate Caption"}
        </button>
        {caption && (
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow text-slate-900 transition">
            <div className="uppercase tracking-wide text-xs font-bold text-slate-400 mb-3">
              AI Generated Caption
            </div>
            {formatCaption(caption)}
          </div>
        )}
        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
}

export default App;
