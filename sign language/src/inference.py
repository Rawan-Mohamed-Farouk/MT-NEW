import numpy as np
import logging
from src.config import model

logger = logging.getLogger(__name__)

class GestureClassifier:
    def __init__(self):
        logger.info("Initializing GestureClassifier...")
        self.model = model
        self.current_gesture = None
        self.confidence = 0.0
        if self.model is None:
            logger.error("Model not loaded in GestureClassifier")
        else:
            logger.info("GestureClassifier initialized successfully")

    def predict(self, landmarks):
        """Predict gesture from landmarks"""
        if self.model is None:
            logger.error("Model not loaded, cannot make predictions")
            return None, 0.0

        if landmarks is None:
            logger.debug("No landmarks provided for prediction")
            return None, 0.0

        try:
            # Reshape landmarks if needed
            if len(landmarks.shape) == 1:
                landmarks = landmarks.reshape(1, -1)

            # Make prediction
            prediction = self.model.predict(landmarks)
            probabilities = self.model.predict_proba(landmarks)[0]
            confidence = np.max(probabilities)
            
            # Update current gesture and confidence
            self.current_gesture = prediction[0]
            self.confidence = confidence
            
            logger.debug(f"Prediction: {self.current_gesture} with confidence: {confidence:.2f}")
            return self.current_gesture, self.confidence
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            return None, 0.0

    def get_current_gesture(self):
        """Get the current detected gesture"""
        return self.current_gesture, self.confidence
