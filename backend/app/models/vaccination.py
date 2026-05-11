import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class VaccinationRecord(Base):
    """A vaccination the user has already received."""
    __tablename__ = "vaccination_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    vaccine_key = Column(String(100), nullable=False)   # matches key in static schedule
    vaccine_name = Column(String(200), nullable=False)
    dose_number = Column(String(10), nullable=True)     # "1", "2", "ревакц."
    date_given = Column(Date, nullable=False)
    clinic = Column(String(200), nullable=True)
    batch_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="vaccination_records")
