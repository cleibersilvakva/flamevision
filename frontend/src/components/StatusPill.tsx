import React from "react";
import type { StatusLevel } from "../api";

function colorForStatus(s: StatusLevel) {
  if (s === "CRITICAL") return "#ef4444";
  if (s === "WARNING") return "#f59e0b";
  return "#22c55e";
}

export function StatusPill(props: { status: StatusLevel; code: string; message: string; sinceTs: number; nowTs: number }) {
  const { status, code, message, sinceTs, nowTs } = props;
  const c = colorForStatus(status);
  const dur = Math.max(0, nowTs - sinceTs);
  const mm = Math.floor(dur / 60);
  const ss = dur % 60;

  return (
    <div style={{
      display: "inline-flex", gap: 10, alignItems: "center",
      border: "1px solid #1f2937",
      background: "rgba(255,255,255,0.02)",
      padding: "10px 12px",
      borderRadius: 14
    }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: c }} />
      <div style={{ fontWeight: 700, letterSpacing: 0.4 }}>{status}</div>
      <div className="small">•</div>
      <div style={{ fontWeight: 650 }}>{code}</div>
      <div className="small">•</div>
      <div style={{ maxWidth: 460, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{message}</div>
      <div className="small">• desde {mm}:{String(ss).padStart(2, "0")}</div>
    </div>
  );
}
