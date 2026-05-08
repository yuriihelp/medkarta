from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class QRTokenCreate(BaseModel):
    mode: str  # single | permanent | partial
    expires_hours: int | None = 24


class QRTokenRead(BaseModel):
    id: UUID
    token: str
    mode: str
    expires_at: datetime | None
    accessed_by: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
