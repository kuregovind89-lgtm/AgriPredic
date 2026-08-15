from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    return db.query(models.User).all()


@router.put("/users/{user_id}/toggle")
def toggle_user(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.get("/diseases", response_model=List[schemas.DiseaseOut])
def list_diseases(db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    return db.query(models.Disease).all()


@router.post("/diseases", response_model=schemas.DiseaseOut)
def add_disease(payload: schemas.DiseaseCreate, db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    disease = models.Disease(**payload.dict())
    db.add(disease)
    db.commit()
    db.refresh(disease)
    return disease


@router.delete("/diseases/{disease_id}")
def delete_disease(disease_id: int, db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    disease = db.query(models.Disease).filter(models.Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    db.delete(disease)
    db.commit()
    return {"message": "Disease deleted"}


@router.get("/predictions", response_model=List[schemas.PredictionOut])
def all_predictions(db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    return db.query(models.Prediction).order_by(models.Prediction.created_at.desc()).all()


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), admin: models.User = Depends(auth.require_admin)):
    total_users = db.query(models.User).count()
    total_predictions = db.query(models.Prediction).count()
    predictions = db.query(models.Prediction).all()

    severity_count = {"Low": 0, "Medium": 0, "High": 0}
    disease_count = {}
    crop_count = {}
    for p in predictions:
        severity_count[p.severity] = severity_count.get(p.severity, 0) + 1
        disease_count[p.disease_name] = disease_count.get(p.disease_name, 0) + 1
        if p.crop:
            crop_count[p.crop] = crop_count.get(p.crop, 0) + 1

    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "severity_breakdown": severity_count,
        "disease_breakdown": disease_count,
        "crop_breakdown": crop_count,
    }
