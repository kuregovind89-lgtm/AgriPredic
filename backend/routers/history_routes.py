from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("/", response_model=List[schemas.PredictionOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Prediction)
        .filter(models.Prediction.user_id == current_user.id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    rows = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id).all()
    severity_count = {"Low": 0, "Medium": 0, "High": 0}
    disease_count = {}
    for r in rows:
        severity_count[r.severity] = severity_count.get(r.severity, 0) + 1
        disease_count[r.disease_name] = disease_count.get(r.disease_name, 0) + 1

    return {
        "total_scans": len(rows),
        "severity_breakdown": severity_count,
        "disease_breakdown": disease_count,
    }
