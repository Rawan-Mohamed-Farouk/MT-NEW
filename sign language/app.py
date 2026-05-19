import streamlit as st
import cv2
import numpy as np
from streamlit_webrtc import webrtc_streamer, VideoTransformerBase
from src.preprocessing import HandPreprocessor
from src.inference import GestureClassifier

# Initialize models
preprocessor = HandPreprocessor()
classifier = GestureClassifier()

class ASLVideoTransformer(VideoTransformerBase):
    def transform(self, frame):
        img = frame.to_ndarray(format="bgr24")
        
        # Process frame
        landmarks, vis_frame = preprocessor.process_frame(img)
        
        if landmarks is not None:
            gesture, confidence = classifier.predict(landmarks)
            if gesture is not None:
                # Draw the prediction on the frame
                cv2.putText(vis_frame, f"{gesture} ({confidence:.2f})", 
                            (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        return vis_frame

st.title("Sign Language Translator")
st.write("Turn on your camera below to start translating.")

webrtc_streamer(key="asl-translator", video_processor_factory=ASLVideoTransformer)