from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.appointment import Appointment
from ..schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentUpdate
from .deps import get_current_user

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentRead])
def list_appointments(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Appointment)
        .filter(Appointment.user_id == user.id)
        .order_by(Appointment.date.asc())
        .all()
    )


@router.post("", response_model=AppointmentRead, status_code=201)
def create_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    appt = Appointment(**data.model_dump(), user_id=user.id)
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.put("/{appt_id}", response_model=AppointmentRead)
def update_appointment(
    appt_id: str,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id, Appointment.user_id == user.id
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(appt, field, val)
    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appt_id}", status_code=204)
def delete_appointment(
    appt_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id, Appointment.user_id == user.id
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt)
    db.commit()
