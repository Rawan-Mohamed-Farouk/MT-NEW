from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import os
import json
import joblib
import numpy as np
import logging

from backend.src.utils.landmark_features import normalize_landmarks

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sign-language", tags=["sign-language"])

# Find model path
# __file__ is /workspace/backend/src/routes/sign_language.py
# 4th parent is workspace root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODEL_PATH = os.path.join(BASE_DIR, "backend", "models", "hand_gesture_classifier.joblib")

if not os.path.exists(MODEL_PATH):
    # Fallback to sign_language/artifacts/hand_gesture_classifier.joblib
    MODEL_PATH = os.path.join(BASE_DIR, "sign_language", "artifacts", "hand_gesture_classifier.joblib")

MODEL_USES_NORMALIZED = False
_meta_path = MODEL_PATH.replace(".joblib", ".meta.json")
if os.path.exists(_meta_path):
    try:
        with open(_meta_path, encoding="utf-8") as f:
            MODEL_USES_NORMALIZED = bool(json.load(f).get("normalized_landmarks", False))
    except Exception:
        pass

model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        logger.info(f"Sign language model loaded successfully from {MODEL_PATH}")
        print(f"Sign language model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Error loading sign language model: {str(e)}")
        print(f"Error loading sign language model: {str(e)}")
else:
    logger.error(f"Sign language model not found at {MODEL_PATH}")
    print(f"Sign language model not found at {MODEL_PATH}")

class LandmarkInput(BaseModel):
    landmarks: list[float]

class PredictionResponse(BaseModel):
    gesture: str
    confidence: float

@router.post("/predict", response_model=PredictionResponse)
def predict_gesture(data: LandmarkInput):
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sign language classifier model is not loaded on the server."
        )
    
    landmarks = data.landmarks
    if len(landmarks) != 63:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Expected exactly 63 landmark coordinates (21 points * 3 dimensions), got {len(landmarks)}."
        )
    
    try:
        flat = np.array(landmarks, dtype=np.float64)
        if MODEL_USES_NORMALIZED:
            flat = normalize_landmarks(flat)
        arr = flat.reshape(1, -1)

        prediction = model.predict(arr)
        probabilities = model.predict_proba(arr)[0]
        confidence = float(np.max(probabilities))
        gesture = str(prediction[0])
        
        return PredictionResponse(gesture=gesture, confidence=confidence)
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )
