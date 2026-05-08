import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.access import QRToken
from ..schemas.access import QRTokenCreate, QRTokenRead
from .deps import get_current_user

router = APIRouter(prefix="/access", tags=["access"])


@router.get("/tokens", response_model=list[QRTokenRead])
def list_tokens(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(QRToken).filter(QRToken.user_id == current_user.id).all()


@router.post("/tokens", response_model=QRTokenRead, status_code=201)
def create_token(
    data: QRTokenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expires_at = None
    if data.expires_hours:
        expires_at = datetime.utcnow() + timedelta(hours=data.expires_hours)

    token = QRToken(
        user_id=current_user.id,
        token=secrets.token_urlsafe(32),
        mode=data.mode,
        expires_at=expires_at,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


@router.delete("/tokens/{token_id}", status_code=204)
def revoke_token(
    token_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token = db.query(QRToken).filter(
        QRToken.id == token_id,
        QRToken.user_id == current_user.id,
    ).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    db.delete(token)
    db.commit()


@router.get("/view/{token}")
def view_by_token(token: str, db: Session = Depends(get_db)):
    qr = db.query(QRToken).filter(QRToken.token == token).first()
    if not qr:
        raise HTTPException(status_code=404, detail="Access denied")
    if qr.expires_at and qr.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Token expired")
    # TODO: return patient records based on mode
    return {"user_id": str(qr.user_id), "mode": qr.mode}
