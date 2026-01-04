import time
import math
import random
from collections import deque
from typing import Deque, List
from .schemas import FurnaceStatus, Thresholds, SeriesPoint, EventItem

def _now() -> int:
    return int(time.time())

def classify(intensity: float, th: Thresholds) -> tuple[str, str, str]:
    if intensity < th.warningMin:
        return ("CRITICAL", "401", "Chama ausente ou muito baixa")
    if intensity < th.normalMin:
        return ("WARNING", "301", "Chama instável / abaixo do ideal")
    return ("NORMAL", "200", "Operação normal")

class Simulator:
    def __init__(self, thresholds: Thresholds | None = None):
        self.th = thresholds or Thresholds()
        self.state_since = _now()
        self.last_status = "NORMAL"
        self.last_code = "200"
        self.last_message = "Operação normal"
        self.events: Deque[EventItem] = deque(maxlen=200)
        self.series: Deque[SeriesPoint] = deque(maxlen=24 * 60 * 60)
        self._seed_history()

    def _seed_history(self):
        now = _now()
        for i in range(180):
            ts = now - (180 - i)
            intensity = self._signal(ts)
            status, code, _ = classify(intensity, self.th)
            self.series.append(SeriesPoint(ts=ts, intensity=float(intensity), status=status, code=code))
        self.last_status = self.series[-1].status
        self.last_code = self.series[-1].code or "200"
        self.last_message = classify(self.series[-1].intensity, self.th)[2]
        self.state_since = now - 30

    def _signal(self, ts: int) -> float:
        base = 38 + 8 * math.sin(ts / 12.0)
        noise = random.uniform(-2.5, 2.5)
        r = (ts % 180)
        if 90 <= r <= 105:
            base = 14 + 3 * math.sin(ts / 2.0)
        return max(0.0, base + noise)

    def tick(self) -> FurnaceStatus:
        ts = _now()
        intensity = float(self._signal(ts))
        status, code, msg = classify(intensity, self.th)

        self.series.append(SeriesPoint(ts=ts, intensity=intensity, status=status, code=code))

        if status != self.last_status:
            self.state_since = ts
            ev = EventItem(
                id=f"EV-{ts}-{random.randint(1000,9999)}",
                ts=ts,
                status=status,
                code=code,
                message=msg,
                intensity=intensity,
                confidence=round(random.uniform(0.86, 0.99), 2),
            )
            self.events.appendleft(ev)

        self.last_status = status
        self.last_code = code
        self.last_message = msg

        return FurnaceStatus(
            ts=ts,
            status=status, code=code, message=msg,
            sinceTs=self.state_since,
            intensity=round(intensity, 2),
            confidence=round(random.uniform(0.86, 0.99), 2),
            stalenessSec=0,
            thresholds=self.th,
            modelVersion="fv-dev-0.1"
        )

    def get_series(self, range_seconds: int = 1800, step_seconds: int = 1) -> List[SeriesPoint]:
        now = _now()
        start = now - range_seconds
        pts = [p for p in self.series if p.ts >= start]

        if step_seconds <= 1:
            return pts

        out: List[SeriesPoint] = []
        bucket = start
        idx = 0
        while bucket <= now:
            window_end = bucket + step_seconds
            last = None
            while idx < len(pts) and pts[idx].ts < window_end:
                last = pts[idx]
                idx += 1
            if last:
                out.append(last)
            bucket = window_end
        return out

    def get_events(self, limit: int = 50) -> List[EventItem]:
        return list(self.events)[:limit]
