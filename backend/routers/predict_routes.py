import os
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from database import get_db
import models, schemas, auth
from ml.predict import predict_disease

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXT = {".jpg", ".jpeg", ".png"}


@router.post("/", response_model=schemas.PredictionOut)
def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images are allowed")

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    result = predict_disease(filepath)

    record = models.Prediction(
        user_id=current_user.id,
        image_path=f"/uploads/{filename}",
        disease_name=result["disease_name"],
        disease_name_mr=result.get("disease_name_mr"),
        crop=result["crop"],
        confidence=result["confidence"],
        severity=result["severity"],
        treatment=result["treatment"],
        fertilizer=result["fertilizer"],
        prevention=result["prevention"],
        treatment_mr=result.get("treatment_mr"),
        fertilizer_mr=result.get("fertilizer_mr"),
        prevention_mr=result.get("prevention_mr"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    if record.severity == "High":
        db.add(models.Notification(
            user_id=current_user.id,
            type="alert",
            title="High Severity Disease Detected",
            message=f"{record.disease_name} was detected on your {record.crop} with {record.confidence}% confidence. Immediate treatment is recommended.",
        ))
        db.commit()

    return record


@router.get("/{prediction_id}/report")
def download_report(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    pred = db.query(models.Prediction).filter(
        models.Prediction.id == prediction_id,
        models.Prediction.user_id == current_user.id,
    ).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    report_path = os.path.join(UPLOAD_DIR, f"report_{prediction_id}.pdf")
    c = canvas.Canvas(report_path, pagesize=A4)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 800, "AgriPredic - Crop Disease Report")
    c.setFont("Helvetica", 12)
    lines = [
        f"Farmer: {current_user.name}",
        f"Date: {pred.created_at}",
        f"Disease: {pred.disease_name}",
        f"Crop: {pred.crop}",
        f"Confidence: {pred.confidence}%",
        f"Severity: {pred.severity}",
        "",
        "Treatment:", pred.treatment or "-",
        "",
        "Fertilizer Recommendation:", pred.fertilizer or "-",
        "",
        "Prevention Tips:", pred.prevention or "-",
    ]
    y = 760
    for line in lines:
        c.drawString(50, y, str(line)[:100])
        y -= 22
    c.save()

    return FileResponse(report_path, filename=f"AgriPredic_Report_{prediction_id}.pdf")
