from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    location: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PredictionOut(BaseModel):
    id: int
    image_path: str
    disease_name: str
    disease_name_mr: Optional[str] = None
    crop: Optional[str]
    confidence: float
    severity: str
    treatment: Optional[str]
    fertilizer: Optional[str]
    prevention: Optional[str]
    treatment_mr: Optional[str] = None
    fertilizer_mr: Optional[str] = None
    prevention_mr: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DiseaseCreate(BaseModel):
    name: str
    crop: str
    severity_default: str = "Medium"
    treatment: Optional[str] = None
    fertilizer: Optional[str] = None
    prevention: Optional[str] = None


class DiseaseOut(DiseaseCreate):
    id: int

    class Config:
        from_attributes = True


class WeatherRiskOut(BaseModel):
    location: str
    temperature: Optional[float]
    humidity: Optional[float]
    rainfall: Optional[float]
    risk_level: str
    risk_reason: Optional[str]


class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
