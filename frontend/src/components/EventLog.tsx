import React from "react";
import type { EventItem } from "../api";

export function EventLog({ events }: { events: EventItem[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {events.length === 0 && <div className="small">Sem eventos recentes.</div>}
      {events.map(ev => (
        <div key={ev.id} style={{
          border: "1px solid #1f2937",
          borderRadius: 12,
          padding: "10px 12px",
          background: "rgba(255,255,255,0.02)"
        }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div style={{ fontWeight: 650 }}>
              {new Date(ev.ts * 1000).toLocaleTimeString()} • {ev.status} • {ev.code}
            </div>
            <div className="small">{ev.intensity.toFixed(1)} • {Math.round(ev.confidence * 100)}%</div>
          </div>
          <div className="small" style={{ marginTop: 6 }}>{ev.message}</div>
        </div>
      ))}
    </div>
  );
}
