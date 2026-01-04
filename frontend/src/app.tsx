import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { captureEvidence, fetchEvents, fetchSeries, fetchStatus, openStatusWebSocket, type EventItem, type FurnaceStatus, type SeriesPoint } from "./api";
import { StatusPill } from "./components/StatusPill";
import { KpiGrid } from "./components/KpiGrid";
import { EventLog } from "./components/EventLog";
import { TimeSeries } from "./components/TimeSeries";

const FURNACE_ID = "CMC2";

function mean(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0) / arr.length;
}
function std(arr: number[]) {
  const m = mean(arr);
  const v = mean(arr.map(x => (x - m) ** 2));
  return Math.sqrt(v);
}

export default function App() {
  const [status, setStatus] = useState<FurnaceStatus | null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [wsOk, setWsOk] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  const avgStd = useMemo(() => {
    const last60 = series.slice(-30).map(p => p.intensity);
    return { avg60: mean(last60), std60: std(last60) };
  }, [series]);

  async function refreshAll() {
    const st = await fetchStatus(FURNACE_ID);
    setStatus(st);
    const pts = await fetchSeries(FURNACE_ID, "30m", "2s");
    setSeries(pts);
    const ev = await fetchEvents(FURNACE_ID, 10);
    setEvents(ev);
  }

  useEffect(() => {
    refreshAll().catch(console.error);

    const ws = openStatusWebSocket(FURNACE_ID);
    wsRef.current = ws;

    ws.onopen = () => setWsOk(true);
    ws.onclose = () => setWsOk(false);
    ws.onerror = () => setWsOk(false);
    ws.onmessage = (msg) => {
      try {
        const st = JSON.parse(msg.data);
        setStatus(st);
      } catch {}
    };

    const t = setInterval(() => {
      Promise.all([
        fetchSeries(FURNACE_ID, "30m", "2s").then(setSeries),
        fetchEvents(FURNACE_ID, 10).then(setEvents),
      ]).catch(console.error);
    }, 5000);

    return () => {
      clearInterval(t);
      ws.close();
      clearInterval(t);
    };
  }, []);

  const st = status;
  return (
    <div className="container">
      <div className="header">
        <div>
          <div style={{ fontWeight: 750 }}>FlameVision</div>
          <div className="small">Fornalha {FURNACE_ID} • Dashboard Operador</div>
        </div>

        {st && (
          <StatusPill status={st.status} code={st.code} message={st.message} sinceTs={st.sinceTs} nowTs={st.ts} />
        )}

        <div style={{ textAlign: "right" }}>
          <div className="small">Status push: {wsOk ? "OK" : "OFF"}</div>
          <button className="btn" onClick={async () => {
            const r = await captureEvidence(FURNACE_ID);
            alert(`Evidência gerada: ${r.evidenceId}`);
          }}>
            Capturar evidência
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="cardTitle">AO VIVO (simulado nesta versão)</div>
          <div className="small">
            Nesta entrega inicial, o “Ao vivo” pode ser integrado via MJPEG/WebRTC. Em dev, mantemos o painel funcional com simulador.
          </div>
          <div style={{
            marginTop: 12,
            height: 340,
            borderRadius: 12,
            border: "1px solid #1f2937",
            background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div className="small">Área reservada para stream (MJPEG/WebRTC)</div>
          </div>
        </div>

        <div className="rightStack">
          <div className="card">
            <div className="cardTitle">MÉTRICAS</div>
            {st && <KpiGrid st={st} avg60={avgStd.avg60} std60={avgStd.std60} />}
            {st && <div className="small" style={{ marginTop: 10 }}>
              Limiar: Normal ≥ {st.thresholds.normalMin} • Atenção ≥ {st.thresholds.warningMin} • Crítico &lt; {st.thresholds.warningMin}
            </div>}
          </div>

          <div className="card">
            <div className="cardTitle">EVENTOS RECENTES</div>
            <EventLog events={events} />
          </div>
        </div>
      </div>

      <div className="card fullWidth">
        <div className="cardTitle">INTENSIDADE AO LONGO DO TEMPO</div>
        {st && <TimeSeries points={series} thresholds={{ normalMin: st.thresholds.normalMin, warningMin: st.thresholds.warningMin }} />}
      </div>
    </div>
  );
}
