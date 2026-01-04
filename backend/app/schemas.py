from pydantic import BaseModel
from typing import Literal, Optional, List

StatusLevel = Literal["NORMAL", "WARNING", "CRITICAL"]

class Thresholds(BaseModel):
    normalMin: float = 30.0
    warningMin: float = 20.0
    criticalMax: float = 19.0

class FurnaceStatus(BaseModel):
    ts: int
    status: StatusLevel
    code: str
    message: str
    sinceTs: int
    intensity: float
    confidence: float
    stalenessSec: int
    thresholds: Thresholds
    modelVersion: str = "fv-dev-0.1"

class SeriesPoint(BaseModel):
    ts: int
    intensity: float
    status: StatusLevel
    code: Optional[str] = None

class SeriesResponse(BaseModel):
    points: List[SeriesPoint]

class EventItem(BaseModel):
    id: str
    ts: int
    status: StatusLevel
    code: str
    message: str
    intensity: float
    confidence: float

class EventsResponse(BaseModel):
    events: List[EventItem]

class CaptureResponse(BaseModel):
    evidenceId: str
