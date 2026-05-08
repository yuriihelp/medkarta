from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel


class IndicatorRead(BaseModel):
    id: UUID
    name: str
    value: float
    unit: str | None
    ref_min: float | None
    ref_max: float | None
    status: str

    model_config = {"from_attributes": True}


class RecordCreate(BaseModel):
    type: str
    title: str
    date: date
    source: str | None = None
    summary: str | None = None


class RecordRead(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    date: date
    source: str | None
    summary: str | None
    file_url: str | None
    ai_interpreted: bool
    created_at: datetime
    indicators: list[IndicatorRead] = []

    model_config = {"from_attributes": True}
