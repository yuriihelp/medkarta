from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, computed_field
from typing import Optional


class CycleCreate(BaseModel):
    start_date: date
    end_date: Optional[date] = None
    symptoms: Optional[list[str]] = None
    notes: Optional[str] = None


class CycleRead(BaseModel):
    id: UUID
    start_date: date
    end_date: Optional[date]
    cycle_length: Optional[str]
    symptoms: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class PregnancyCreate(BaseModel):
    lmp_date: date
    child_name: Optional[str] = None
    child_gender: Optional[str] = "unknown"


class PregnancyRead(BaseModel):
    id: UUID
    lmp_date: date
    due_date: date
    is_active: bool
    child_name: Optional[str]
    child_gender: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class PregnancyUpdate(BaseModel):
    child_name: Optional[str] = None
    child_gender: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class WomenStatusRead(BaseModel):
    is_pregnant: bool
    active_pregnancy: Optional[PregnancyRead]
    last_cycle: Optional[CycleRead]
    avg_cycle_length: int = 28
