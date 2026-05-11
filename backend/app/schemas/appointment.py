from datetime import date, time, datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    date: date
    time: Optional[time] = None
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    clinic: Optional[str] = None
    notes: Optional[str] = None


class AppointmentRead(BaseModel):
    id: UUID
    date: date
    time: Optional[time]
    doctor_name: Optional[str]
    specialty: Optional[str]
    clinic: Optional[str]
    notes: Optional[str]
    is_done: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AppointmentUpdate(BaseModel):
    date: Optional[date] = None
    time: Optional[time] = None
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    clinic: Optional[str] = None
    notes: Optional[str] = None
    is_done: Optional[bool] = None
