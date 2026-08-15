import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/weather", tags=["Weather"])

# Open-Meteo is free and requires no API key -- good default for a working demo.
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def _assess_risk(temperature: float, humidity: float, rainfall: float):
    """Simple agronomy heuristic: fungal crop diseases (blight, mildew, rust)
    thrive in warm + humid + wet conditions. Replace with a trained model
    for production-grade risk scoring."""
    score = 0
    reasons = []

    if humidity is not None and humidity >= 80:
        score += 2
        reasons.append("High humidity favors fungal spore germination")
    elif humidity is not None and humidity >= 60:
        score += 1
        reasons.append("Moderate humidity")

    if temperature is not None and 20 <= temperature <= 30:
        score += 2
        reasons.append("Temperature in the optimal range for pathogen growth")

    if rainfall is not None and rainfall > 5:
        score += 2
        reasons.append("Recent rainfall increases leaf wetness duration")

    if score >= 5:
        level = "High"
    elif score >= 3:
        level = "Medium"
    else:
        level = "Low"
        reasons.append("Conditions are currently unfavorable for major outbreaks")

    return level, "; ".join(reasons)


@router.get("/risk", response_model=schemas.WeatherRiskOut)
def weather_risk(
    location: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    geo = requests.get(GEOCODE_URL, params={"name": location, "count": 1}, timeout=10).json()
    results = geo.get("results")
    if not results:
        raise HTTPException(status_code=404, detail="Location not found")

    lat, lon = results[0]["latitude"], results[0]["longitude"]

    forecast = requests.get(FORECAST_URL, params={
        "latitude": lat, "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation",
    }, timeout=10).json()

    current = forecast.get("current", {})
    temperature = current.get("temperature_2m")
    humidity = current.get("relative_humidity_2m")
    rainfall = current.get("precipitation")

    level, reason = _assess_risk(temperature, humidity, rainfall)

    record = models.WeatherRisk(
        user_id=current_user.id, location=location,
        temperature=temperature, humidity=humidity, rainfall=rainfall,
        risk_level=level, risk_reason=reason,
    )
    db.add(record)
    db.commit()

    if level == "High":
        db.add(models.Notification(
            user_id=current_user.id,
            type="alert",
            title="High Disease Risk Alert",
            message=f"Weather conditions in {location} currently favor disease outbreaks: {reason}.",
        ))
        db.commit()

    return {
        "location": location, "temperature": temperature, "humidity": humidity,
        "rainfall": rainfall, "risk_level": level, "risk_reason": reason,
    }
