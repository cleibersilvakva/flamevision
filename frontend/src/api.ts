export type StatusLevel = "NORMAL" | "WARNING" | "CRITICAL";

export type FurnaceStatus = {
  ts: number;
  status: StatusLevel;
  code: string;
  message: string;
  sinceTs: number;
  intensity: number;
  confidence: number;
  stalenessSec: number;
  thresholds: { normalMin: number; warningMin: number; criticalMax: number };
  modelVersion: string;
};

export type SeriesPoint = { ts: number; intensity: number; status: StatusLevel; code?: string };
export type EventItem = { id: string; ts: number; status: StatusLevel; code: string; message: string; intensity: number; confidence: number };

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8081";

export async function fetchStatus(furnaceId: string): Promise<FurnaceStatus> {
  const res = await fetch(`${API_BASE}/api/v1/furnaces/${furnaceId}/status`);
  if (!res.ok) throw new Error("status fetch failed");
  return res.json();
}

export async function fetchSeries(furnaceId: string, range = "30m", step = "2s"): Promise<SeriesPoint[]> {
  const res = await fetch(`${API_BASE}/api/v1/furnaces/${furnaceId}/series?range=${range}&step=${step}`);
  if (!res.ok) throw new Error("series fetch failed");
  const data = await res.json();
  return data.points;
}

export async function fetchEvents(furnaceId: string, limit = 20): Promise<EventItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/furnaces/${furnaceId}/events?limit=${limit}`);
  if (!res.ok) throw new Error("events fetch failed");
  const data = await res.json();
  return data.events;
}

export async function captureEvidence(furnaceId: string): Promise<{ evidenceId: string }> {
  const res = await fetch(`${API_BASE}/api/v1/furnaces/${furnaceId}/capture`, { method: "POST" });
  if (!res.ok) throw new Error("capture failed");
  return res.json();
}

export function openStatusWebSocket(furnaceId: string): WebSocket {
  const wsBase = API_BASE.replace("http://", "ws://").replace("https://", "wss://");
  return new WebSocket(`${wsBase}/ws/furnaces/${furnaceId}`);
}
