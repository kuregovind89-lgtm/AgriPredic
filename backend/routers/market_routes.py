from fastapi import APIRouter, Depends
import models, auth

router = APIRouter(prefix="/api/market", tags=["Market"])

# Placeholder static data. In production, swap this for a live mandi/market
# price API such as data.gov.in's Agmarknet API (India) - just replace the
# body of get_prices() with a requests.get(...) call.
MOCK_PRICES = [
    {"crop": "Tomato", "market": "Pune APMC", "price_per_quintal": 1450, "trend": "up"},
    {"crop": "Potato", "market": "Pune APMC", "price_per_quintal": 980, "trend": "down"},
    {"crop": "Onion", "market": "Pune APMC", "price_per_quintal": 1620, "trend": "up"},
    {"crop": "Corn", "market": "Nashik APMC", "price_per_quintal": 1120, "trend": "stable"},
    {"crop": "Grape", "market": "Nashik APMC", "price_per_quintal": 5200, "trend": "up"},
    {"crop": "Apple", "market": "Narayangaon APMC", "price_per_quintal": 8700, "trend": "stable"},
]


@router.get("/prices")
def get_prices(current_user: models.User = Depends(auth.get_current_user)):
    return MOCK_PRICES
