import React from "react";
import type { FurnaceStatus } from "../api";

export function KpiGrid({ st, avg60, std60 }: { st: FurnaceStatus; avg60: number; std60: number }) {
  return (
    <div className="kpis">
      <div className="kpi">
        <div className="label">Intensidade atual</div>
        <div className="value">{st.intensity.toFixed(1)}</div>
      </div>
      <div className="kpi">
        <div className="label">Média 60s</div>
        <div className="value">{avg60.toFixed(1)}</div>
      </div>
      <div className="kpi">
        <div className="label">Variação 60s (estabilidade)</div>
        <div className="value">{std60.toFixed(1)}</div>
      </div>
      <div className="kpi">
        <div className="label">Confiança</div>
        <div className="value">{Math.round(st.confidence * 100)}%</div>
      </div>
    </div>
  );
}
