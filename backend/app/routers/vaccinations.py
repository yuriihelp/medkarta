from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.vaccination import VaccinationRecord
from ..schemas.vaccination import VaccinationRecordCreate, VaccinationRecordRead
from .deps import get_current_user

router = APIRouter(prefix="/vaccinations", tags=["vaccinations"])


@router.get("", response_model=list[VaccinationRecordRead])
def list_vaccinations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(VaccinationRecord)
        .filter(VaccinationRecord.user_id == user.id)
        .order_by(VaccinationRecord.date_given.desc())
        .all()
    )


@router.post("", response_model=VaccinationRecordRead, status_code=201)
def add_vaccination(
    data: VaccinationRecordCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rec = VaccinationRecord(**data.model_dump(), user_id=user.id)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{record_id}", status_code=204)
def delete_vaccination(
    record_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rec = db.query(VaccinationRecord).filter(
        VaccinationRecord.id == record_id,
        VaccinationRecord.user_id == user.id,
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(rec)
    db.commit()
