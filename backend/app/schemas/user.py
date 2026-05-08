from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel


class UserCreate(BaseModel):
    phone: str
    password: str
    full_name: str


class UserLogin(BaseModel):
    phone: str
    password: str


class UserRead(BaseModel):
    id: UUID
    phone: str
    full_name: str
    birth_date: date | None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
