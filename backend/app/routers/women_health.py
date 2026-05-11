import json
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.women_health import MenstrualCycle, Pregnancy
from ..schemas.women_health import (
    CycleCreate, CycleRead, PregnancyCreate, PregnancyRead,
    PregnancyUpdate, WomenStatusRead,
)
from .deps import get_current_user

router = APIRouter(prefix="/women", tags=["women-health"])


def _require_female(user: User):
    if user.gender != "female":
        raise HTTPException(status_code=403, detail="This section is for female users")


def _calc_due_date(lmp: date) -> date:
    return lmp + timedelta(days=280)


# ── Status ──────────────────────────────────────────────────────────────────

@router.get("/status", response_model=WomenStatusRead)
def get_status(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_female(user)

    active = (
        db.query(Pregnancy)
        .filter(Pregnancy.user_id == user.id, Pregnancy.is_active == True)
        .order_by(Pregnancy.created_at.desc())
        .first()
    )
    last_cycle = (
        db.query(MenstrualCycle)
        .filter(MenstrualCycle.user_id == user.id)
        .order_by(MenstrualCycle.start_date.desc())
        .first()
    )

    # Calculate average cycle length from last 6 cycles
    cycles = (
        db.query(MenstrualCycle)
        .filter(MenstrualCycle.user_id == user.id, MenstrualCycle.end_date.isnot(None))
        .order_by(MenstrualCycle.start_date.desc())
        .limit(6)
        .all()
    )
    avg = 28
    if len(cycles) >= 2:
        lengths = []
        for i in range(len(cycles) - 1):
            diff = (cycles[i].start_date - cycles[i + 1].start_date).days
            if 20 <= diff <= 45:
                lengths.append(diff)
        if lengths:
            avg = round(sum(lengths) / len(lengths))

    return WomenStatusRead(
        is_pregnant=bool(active),
        active_pregnancy=active,
        last_cycle=last_cycle,
        avg_cycle_length=avg,
    )


# ── Menstrual cycles ─────────────────────────────────────────────────────────

@router.get("/cycles", response_model=list[CycleRead])
def list_cycles(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_female(user)
    return (
        db.query(MenstrualCycle)
        .filter(MenstrualCycle.user_id == user.id)
        .order_by(MenstrualCycle.start_date.desc())
        .limit(12)
        .all()
    )


@router.post("/cycles", response_model=CycleRead, status_code=201)
def create_cycle(
    data: CycleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_female(user)
    symptoms_json = json.dumps(data.symptoms) if data.symptoms else None
    cycle = MenstrualCycle(
        user_id=user.id,
        start_date=data.start_date,
        end_date=data.end_date,
        symptoms=symptoms_json,
        notes=data.notes,
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


@router.put("/cycles/{cycle_id}", response_model=CycleRead)
def update_cycle(
    cycle_id: str,
    data: CycleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_female(user)
    cycle = db.query(MenstrualCycle).filter(
        MenstrualCycle.id == cycle_id,
        MenstrualCycle.user_id == user.id,
    ).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    cycle.start_date = data.start_date
    cycle.end_date = data.end_date
    cycle.symptoms = json.dumps(data.symptoms) if data.symptoms else None
    cycle.notes = data.notes
    db.commit()
    db.refresh(cycle)
    return cycle


@router.delete("/cycles/{cycle_id}", status_code=204)
def delete_cycle(
    cycle_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_female(user)
    cycle = db.query(MenstrualCycle).filter(
        MenstrualCycle.id == cycle_id,
        MenstrualCycle.user_id == user.id,
    ).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    db.delete(cycle)
    db.commit()


# ── Pregnancy ────────────────────────────────────────────────────────────────

@router.post("/pregnancy", response_model=PregnancyRead, status_code=201)
def start_pregnancy(
    data: PregnancyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_female(user)
    # Deactivate any existing active pregnancy
    db.query(Pregnancy).filter(
        Pregnancy.user_id == user.id,
        Pregnancy.is_active == True,
    ).update({"is_active": False})

    pregnancy = Pregnancy(
        user_id=user.id,
        lmp_date=data.lmp_date,
        due_date=_calc_due_date(data.lmp_date),
        child_name=data.child_name,
        child_gender=data.child_gender or "unknown",
    )
    db.add(pregnancy)
    db.commit()
    db.refresh(pregnancy)
    return pregnancy


@router.put("/pregnancy/{pregnancy_id}", response_model=PregnancyRead)
def update_pregnancy(
    pregnancy_id: str,
    data: PregnancyUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_female(user)
    p = db.query(Pregnancy).filter(
        Pregnancy.id == pregnancy_id,
        Pregnancy.user_id == user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pregnancy not found")
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(p, field, val)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/pregnancy/{pregnancy_id}", status_code=204)
def end_pregnancy(
    pregnancy_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_female(user)
    p = db.query(Pregnancy).filter(
        Pregnancy.id == pregnancy_id,
        Pregnancy.user_id == user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pregnancy not found")
    p.is_active = False
    db.commit()
