import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
from .settings import settings
from .schemas import FurnaceStatus, SeriesResponse, EventsResponse, CaptureResponse
from .simulator import Simulator

app = FastAPI(title="FlameVision API", version="0.1.0")

# Em produto: restrinja allow_origins ao host do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sim = Simulator()
latest: Dict[str, FurnaceStatus] = {}

@app.on_event("startup")
async def startup():
    if settings.sim_mode:
        async def loop():
            while True:
                st = sim.tick()
                latest[settings.sim_furnace_id] = st
                await asyncio.sleep(1.0)
        asyncio.create_task(loop())

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True, "sim_mode": settings.sim_mode}

@app.get("/api/v1/furnaces/{furnace_id}/status", response_model=FurnaceStatus)
def get_status(furnace_id: str):
    st = latest.get(furnace_id) or latest.get(settings.sim_furnace_id)
    if st is None:
        st = sim.tick()
        latest[furnace_id] = st
    return st

@app.get("/api/v1/furnaces/{furnace_id}/series", response_model=SeriesResponse)
def get_series(furnace_id: str, range: str = "30m", step: str = "1s"):
    def parse_duration(s: str) -> int:
        s = s.strip().lower()
        if s.endswith("m"): return int(s[:-1]) * 60
        if s.endswith("h"): return int(s[:-1]) * 3600
        if s.endswith("s"): return int(s[:-1])
        return int(s)

    rs = parse_duration(range)
    ss = parse_duration(step)
    pts = sim.get_series(range_seconds=rs, step_seconds=ss)
    return SeriesResponse(points=pts)

@app.get("/api/v1/furnaces/{furnace_id}/events", response_model=EventsResponse)
def get_events(furnace_id: str, limit: int = 50):
    evs = sim.get_events(limit=limit)
    return EventsResponse(events=evs)

@app.post("/api/v1/furnaces/{furnace_id}/capture", response_model=CaptureResponse)
def capture(furnace_id: str):
    import time, random
    eid = f"EVID-{int(time.time())}-{random.randint(1000,9999)}"
    return CaptureResponse(evidenceId=eid)

@app.websocket("/ws/furnaces/{furnace_id}")
async def ws_furnace(websocket: WebSocket, furnace_id: str):
    await websocket.accept()
    try:
        while True:
            st = latest.get(furnace_id) or latest.get(settings.sim_furnace_id)
            if st is None:
                st = sim.tick()
                latest[furnace_id] = st
            await websocket.send_json(st.model_dump())
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        return
