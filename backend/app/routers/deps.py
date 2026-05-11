from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..config import settings

bearer = HTTPBearer()

DEMO_TOKENS = {
    "demo_male_token":   {"id": "demo-male",   "full_name": "Иван Петров",   "gender": "male",   "phone": "+79990000001", "birth_date": "1990-05-15"},
    "demo_female_token": {"id": "demo-female", "full_name": "Мария Иванова", "gender": "female", "phone": "+79990000002", "birth_date": "1995-08-22"},
}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials

    # Demo mode: return synthetic user without DB lookup
    if token in DEMO_TOKENS:
        data = DEMO_TOKENS[token]
        mock = User()
        mock.id = data["id"]
        mock.full_name = data["full_name"]
        mock.gender = data["gender"]
        mock.phone = data["phone"]
        mock.birth_date = data["birth_date"]
        return mock

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
