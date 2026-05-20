import os
from dotenv import load_dotenv
import joblib

# Load environment variables from .env file
load_dotenv()

# Get base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

APP_NAME = os.getenv("APP_NAME")
VERSION = os.getenv('VERSION')
API_KEY = os.getenv('API_KEY')
# Application settings
class Settings:
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    try:
        PORT: int = int(os.getenv("PORT", "8000")) if os.getenv("PORT") else 8000
    except ValueError:
        PORT: int = 8000
    API_KEY: str = os.getenv("API_KEY")
    
    # MediaPipe settings
    MAX_NUM_HANDS: int = int(os.getenv("MAX_NUM_HANDS", "2"))
    MIN_DETECTION_CONFIDENCE: float = float(os.getenv("MIN_DETECTION_CONFIDENCE", "0.5"))
    MIN_TRACKING_CONFIDENCE: float = float(os.getenv("MIN_TRACKING_CONFIDENCE", "0.5"))
    
    # Video settings
    CAMERA_INDEX: int = int(os.getenv("CAMERA_INDEX", "0"))
    FRAME_WIDTH: int = int(os.getenv("FRAME_WIDTH", "440"))
    FRAME_HEIGHT: int = int(os.getenv("FRAME_HEIGHT", "340"))
    
    # Debug settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

# Create settings instance
settings = Settings()

# Load the trained model
MODEL_PATH = os.path.join(BASE_DIR, "artifacts", 'hand_gesture_classifier.joblib')
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Model loaded successfully ")
    else:
        print(f"Model file not found ")
        model = None
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None


