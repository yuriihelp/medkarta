import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Date, Boolean, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # analysis | prescription | discharge | vaccination | imaging | other
    title = Column(String(300), nullable=False)
    date = Column(Date, nullable=False)
    source = Column(String(200), nullable=True)
    summary = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    ai_interpreted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="records")
    indicators = relationship("Indicator", back_populates="record", cascade="all, delete-orphan")


class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    record_id = Column(UUID(as_uuid=True), ForeignKey("medical_records.id"), nullable=False)
    name = Column(String(200), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    ref_min = Column(Float, nullable=True)
    ref_max = Column(Float, nullable=True)
    status = Column(String(20), default="normal")  # normal | low | high

    record = relationship("MedicalRecord", back_populates="indicators")
