import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import type { SeriesPoint } from "../api";

function fmtTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString();
}

export function TimeSeries({ points, thresholds }: { points: SeriesPoint[]; thresholds: { normalMin: number; warningMin: number } }) {
  const data = points.map(p => ({ ...p, t: fmtTime(p.ts) }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="t" tick={{ fill: "#9ca3af", fontSize: 12 }} minTickGap={35} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", color: "#e5e7eb" }} />
          <ReferenceLine y={thresholds.normalMin} strokeDasharray="4 4" />
          <ReferenceLine y={thresholds.warningMin} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="intensity" stroke="#e5e7eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
