from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.record import MedicalRecord
from ..schemas.record import RecordCreate, RecordRead
from .deps import get_current_user

router = APIRouter(prefix="/records", tags=["records"])


@router.get("", response_model=list[RecordRead])
def list_records(
    type: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id)
    if type:
        q = q.filter(MedicalRecord.type == type)
    return q.order_by(MedicalRecord.date.desc()).offset(offset).limit(limit).all()


@router.post("", response_model=RecordRead, status_code=201)
def create_record(
    data: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = MedicalRecord(**data.model_dump(), user_id=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{record_id}", response_model=RecordRead)
def get_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.delete("/{record_id}", status_code=204)
def delete_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()


@router.post("/upload", response_model=RecordRead, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # TODO: OCR processing + AI structuring
    from datetime import date
    record = MedicalRecord(
        user_id=current_user.id,
        type="other",
        title=file.filename or "Загруженный документ",
        date=date.today(),
        source="Загружен вручную",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
