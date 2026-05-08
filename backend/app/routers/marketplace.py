from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


class MarketplaceItem(BaseModel):
    id: str
    name: str
    address: str
    distance_km: float
    price: float | None
    rating: float | None


# Stub data — replace with real partner APIs
STUB_PHARMACIES = [
    MarketplaceItem(id="1", name="Аптека №1", address="ул. Ленина, 12", distance_km=0.3, price=245, rating=4.8),
    MarketplaceItem(id="2", name="Планета Здоровья", address="пр. Мира, 45", distance_km=0.7, price=289, rating=4.5),
]

STUB_LABS = [
    MarketplaceItem(id="1", name="Helix", address="ул. Арбат, 5", distance_km=0.5, price=1800, rating=4.9),
    MarketplaceItem(id="2", name="Инвитро", address="пр. Победы, 22", distance_km=0.9, price=2100, rating=4.7),
]

STUB_DOCTORS = [
    MarketplaceItem(id="1", name="Иванова А.В. · Терапевт", address="Клиника Медси", distance_km=0.4, price=2500, rating=4.9),
    MarketplaceItem(id="2", name="Петров С.Н. · Кардиолог", address="Клиника К+31", distance_km=1.1, price=3500, rating=4.8),
]


@router.get("/pharmacies", response_model=list[MarketplaceItem])
def search_pharmacies(
    query: str | None = Query(None),
    lat: float | None = Query(None),
    lng: float | None = Query(None),
):
    return STUB_PHARMACIES


@router.get("/labs", response_model=list[MarketplaceItem])
def search_labs(
    lat: float | None = Query(None),
    lng: float | None = Query(None),
):
    return STUB_LABS


@router.get("/doctors", response_model=list[MarketplaceItem])
def search_doctors(specialty: str | None = Query(None)):
    return STUB_DOCTORS
