"""
Inference wrapper. If a trained model exists at ml/saved_model/agripredic_model.h5
it is used directly. Otherwise, AgriPredic runs in DEMO MODE: a lightweight
OpenCV color-analysis heuristic estimates leaf discoloration/spotting to
produce a plausible disease + confidence, so the whole product works
end-to-end before you've trained on PlantVillage. Swap in your trained
model at any time -- no other code changes are required.
"""
import os
import json
import random
import numpy as np
import cv2

from ml.preprocess import load_and_preprocess, IMG_SIZE
from ml.disease_info import DISEASE_INFO, DISEASE_CLASSES

SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved_model")
MODEL_PATH = os.path.join(SAVE_DIR, "agripredic_model.h5")
CLASS_MAP_PATH = os.path.join(SAVE_DIR, "class_indices.json")

_model = None
_class_map = None


def _load_model_if_available():
    global _model, _class_map
    if _model is not None:
        return _model
    if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_MAP_PATH):
        import tensorflow as tf  # imported lazily to keep API boot fast in demo mode
        _model = tf.keras.models.load_model(MODEL_PATH)
        with open(CLASS_MAP_PATH) as f:
            _class_map = {int(k): v for k, v in json.load(f).items()}
    return _model


def _severity_from_confidence(disease_name: str, confidence: float) -> str:
    base = DISEASE_INFO.get(disease_name, {}).get("severity", "Medium")
    if "Healthy" in disease_name:
        return "Low"
    # Escalate severity if the model is very confident about a disease
    if confidence >= 0.85:
        return "High" if base != "Low" else "Medium"
    if confidence >= 0.6:
        return base
    return "Low" if base == "Low" else "Medium"


def _demo_heuristic_predict(image_path: str):
    """Analyzes brown/yellow spotting ratio via HSV color masking to fake a
    reasonable disease classification when no trained model is present."""
    img = cv2.imread(image_path)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Brown/yellow blight-like spots
    lower_brown = np.array([8, 40, 20])
    upper_brown = np.array([30, 255, 200])
    mask = cv2.inRange(hsv, lower_brown, upper_brown)
    spot_ratio = float(np.sum(mask > 0)) / (IMG_SIZE * IMG_SIZE)

    if spot_ratio < 0.03:
        disease = "Tomato___Healthy"
        confidence = round(random.uniform(0.90, 0.98), 4)
    elif spot_ratio < 0.12:
        disease = "Tomato___Early_Blight"
        confidence = round(0.55 + spot_ratio * 2, 4)
    else:
        disease = "Tomato___Late_Blight"
        confidence = round(min(0.97, 0.6 + spot_ratio), 4)

    return disease, confidence


def predict_disease(image_path: str):
    """Returns dict: disease_name, crop, confidence, severity, treatment,
    fertilizer, prevention. Works whether or not a trained model is present."""
    model = _load_model_if_available()

    if model is not None:
        x = load_and_preprocess(image_path)
        x = np.expand_dims(x, axis=0)
        preds = model.predict(x, verbose=0)[0]
        idx = int(np.argmax(preds))
        disease_name = _class_map.get(idx, DISEASE_CLASSES[idx % len(DISEASE_CLASSES)])
        confidence = float(preds[idx])
    else:
        disease_name, confidence = _demo_heuristic_predict(image_path)

    info = DISEASE_INFO.get(disease_name, {
        "crop": disease_name.split("___")[0] if "___" in disease_name else "Unknown",
        "severity": "Medium",
        "treatment": "Consult local agriculture extension office for specific guidance.",
        "fertilizer": "Use balanced NPK fertilizer as per soil test recommendation.",
        "prevention": "Practice crop rotation and field sanitation.",
        "name_mr": disease_name.replace("___", " - ").replace("_", " "),
        "treatment_mr": "अचूक मार्गदर्शनासाठी स्थानिक कृषी विस्तार कार्यालयाशी संपर्क साधा.",
        "fertilizer_mr": "मातीच्या परीक्षणानुसार संतुलित NPK खत वापरा.",
        "prevention_mr": "पीक फेरपालट आणि शेतातील स्वच्छता राखा.",
    })

    severity = _severity_from_confidence(disease_name, confidence)

    return {
        "disease_name": disease_name.replace("___", " - ").replace("_", " "),
        "disease_name_mr": info.get("name_mr", disease_name.replace("___", " - ").replace("_", " ")),
        "crop": info["crop"],
        "confidence": round(confidence * 100, 2),
        "severity": severity,
        "treatment": info["treatment"],
        "fertilizer": info["fertilizer"],
        "prevention": info["prevention"],
        "treatment_mr": info.get("treatment_mr", info["treatment"]),
        "fertilizer_mr": info.get("fertilizer_mr", info["fertilizer"]),
        "prevention_mr": info.get("prevention_mr", info["prevention"]),
    }
