import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database import Base, engine, SessionLocal
import models, auth
from ml.disease_info import DISEASE_INFO
from routers import auth_routes, predict_routes, history_routes, admin_routes, weather_routes, market_routes, notification_routes

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgriPredic API",
    description="AI-powered crop disease detection and risk prediction platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_routes.router)
app.include_router(predict_routes.router)
app.include_router(history_routes.router)
app.include_router(admin_routes.router)
app.include_router(weather_routes.router)
app.include_router(market_routes.router)
app.include_router(notification_routes.router)


@app.get("/")
def root():
    return {"message": "AgriPredic API is running", "docs": "/docs"}


@app.on_event("startup")
def seed_data():
    """Creates a default admin account and seeds the diseases table so the
    Admin Panel has data to show immediately after first run."""
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@agripredic.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "Admin@123")

        if not db.query(models.User).filter(models.User.email == admin_email).first():
            admin_user = models.User(
                name="AgriPredic Admin",
                email=admin_email,
                hashed_password=auth.hash_password(admin_password),
                role="admin",
            )
            db.add(admin_user)

        if db.query(models.Disease).count() == 0:
            for name, info in DISEASE_INFO.items():
                db.add(models.Disease(
                    name=name.replace("___", " - ").replace("_", " "),
                    crop=info["crop"],
                    severity_default=info["severity"],
                    treatment=info["treatment"],
                    fertilizer=info["fertilizer"],
                    prevention=info["prevention"],
                ))
        db.commit()
    finally:
        db.close()
