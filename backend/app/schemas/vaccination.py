from datetime import date, datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class VaccinationRecordCreate(BaseModel):
    vaccine_key: str
    vaccine_name: str
    dose_number: Optional[str] = None
    date_given: date
    clinic: Optional[str] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None


class VaccinationRecordRead(BaseModel):
    id: UUID
    vaccine_key: str
    vaccine_name: str
    dose_number: Optional[str]
    date_given: date
    clinic: Optional[str]
    batch_number: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
