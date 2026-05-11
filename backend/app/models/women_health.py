import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Date, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from ..database import Base


class MenstrualCycle(Base):
    __tablename__ = "menstrual_cycles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    cycle_length = Column(String(5), nullable=True)   # days, calculated
    symptoms = Column(Text, nullable=True)             # JSON string: ["pain","mood","bloating"]
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="menstrual_cycles")


class Pregnancy(Base):
    __tablename__ = "pregnancies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lmp_date = Column(Date, nullable=False)        # last menstrual period date
    due_date = Column(Date, nullable=False)         # estimated due date (lmp + 280 days)
    is_active = Column(Boolean, default=True)
    child_name = Column(String(100), nullable=True)
    child_gender = Column(String(10), nullable=True)  # 'boy' | 'girl' | 'unknown'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="pregnancies")
