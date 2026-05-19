import cv2
import mediapipe as mp
import numpy as np
import logging
from src.config import settings
import os

logger = logging.getLogger(__name__)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # force CPU

class HandPreprocessor:
    def __init__(self):
        logger.info("Initializing MediaPipe Hands...")
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            model_complexity=1
)

        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        logger.info("MediaPipe Hands initialized successfully")

    def process_frame(self, frame):
        """Process a single frame and extract hand landmarks"""
        try:
            # Convert the BGR image to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process the frame with MediaPipe Hands
            results = self.hands.process(rgb_frame)
            
            # Initialize variables for landmarks and visualization
            landmarks_data = None
            visualization_frame = frame.copy()
            
            if results.multi_hand_landmarks:
                # Get landmarks for the first detected hand
                hand_landmarks = results.multi_hand_landmarks[0]
                
                # Extract landmark coordinates
                landmarks = []
                for landmark in hand_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z])
                landmarks_data = np.array(landmarks)
                
                # Draw hand landmarks on the visualization frame
                self.mp_drawing.draw_landmarks(
                    visualization_frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing_styles.get_default_hand_landmarks_style(),
                    self.mp_drawing_styles.get_default_hand_connections_style()
                )
            
            return landmarks_data, visualization_frame
        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}")
            return None, frame

    def release(self):
        """Release resources"""
        try:
            self.hands.close()
            logger.info("MediaPipe Hands resources released")
        except Exception as e:
            logger.error(f"Error releasing MediaPipe Hands resources: {str(e)}")
