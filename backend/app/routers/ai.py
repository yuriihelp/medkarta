from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.record import MedicalRecord
from ..config import settings
from ..gigachat import get_gigachat
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
    context_parts = []

    # Attach record context if provided
    if req.record_id:
        record = db.query(MedicalRecord).filter(
            MedicalRecord.id == req.record_id,
            MedicalRecord.user_id == current_user.id,
        ).first()
        if record:
            context_parts.append(
                f"Документ: {record.title}, дата: {record.date}, "
                f"резюме: {record.summary or 'нет'}"
            )

    # Basic user context
    if current_user.birth_date:
        context_parts.append(f"Дата рождения пациента: {current_user.birth_date}")

    context = "\n".join(context_parts)

    if not settings.gigachat_api_key:
        return ChatResponse(
            reply=(
                "ИИ-ассистент не настроен. Укажите GIGACHAT_API_KEY в конфигурации сервера."
            )
        )

    try:
        client = get_gigachat(settings.gigachat_api_key)
        reply = await client.chat(req.message, context=context)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GigaChat error: {str(e)}")


@router.post("/interpret/{record_id}")
async def interpret_record(
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
    return {"status": "queued", "record_id": record_id}
