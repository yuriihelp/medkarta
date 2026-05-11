import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Date, Boolean, Text, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)
    doctor_name = Column(String(200), nullable=True)
    specialty = Column(String(100), nullable=True)
    clinic = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    is_done = Column(Boolean, default=False)
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="appointments")
