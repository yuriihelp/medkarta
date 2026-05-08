from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, records, ai, access, marketplace

app = FastAPI(
    title="ПУЛЬС API",
    description="Единая медицинская книжка — API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(records.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(access.router, prefix="/api")
app.include_router(marketplace.router, prefix="/api")

Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ПУЛЬС API"}
