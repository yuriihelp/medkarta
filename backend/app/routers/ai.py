from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.record import MedicalRecord
from .deps import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    record_id: str | None = None


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # TODO: integrate GigaChat / YandexGPT with RAG
    context = ""
    if req.record_id:
        record = db.query(MedicalRecord).filter(
            MedicalRecord.id == req.record_id,
            MedicalRecord.user_id == current_user.id,
        ).first()
        if record:
            context = f"Контекст: {record.title}, {record.date}, {record.summary or ''}"

    stub_reply = (
        f"Это демо-режим ИИ-ассистента. "
        f"Ваш вопрос получен: «{req.message[:80]}». "
        f"Для реальных ответов подключите GigaChat API в настройках."
    )
    return ChatResponse(reply=stub_reply)


@router.post("/interpret/{record_id}")
async def interpret_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # TODO: OCR + AI structuring pipeline
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"status": "queued", "record_id": record_id}
