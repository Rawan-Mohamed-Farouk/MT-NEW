import os
import sys
import pytest
import numpy as np
from unittest.mock import Mock, patch

# Add the parent directory to the Python path to find the src module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock dependencies before importing
sys.modules['cv2'] = Mock()
sys.modules['mediapipe'] = Mock()
sys.modules['mediapipe.solutions'] = Mock()
sys.modules['mediapipe.solutions.hands'] = Mock()
sys.modules['mediapipe.solutions.drawing_utils'] = Mock()
sys.modules['mediapipe.solutions.drawing_styles'] = Mock()

# Now import the module
from src.preprocessing import HandPreprocessor
from src.config import settings

# Fixtures for test setup
@pytest.fixture
def hand_preprocessor():
    # Create a mock Hands instance with proper attributes
    mock_hands = Mock()
    mock_hands.static_image_mode = False
    mock_hands.max_num_hands = settings.MAX_NUM_HANDS
    mock_hands.min_detection_confidence = settings.MIN_DETECTION_CONFIDENCE
    mock_hands.min_tracking_confidence = settings.MIN_TRACKING_CONFIDENCE
    
    # Create mock drawing utils and styles
    mock_drawing_utils = Mock()
    mock_drawing_styles = Mock()
    mock_drawing_styles.get_default_hand_landmarks_style = Mock(return_value={})
    mock_drawing_styles.get_default_hand_connections_style = Mock(return_value={})
    
    # Set up the mock mediapipe structure
    mock_mediapipe = sys.modules['mediapipe']
    mock_mediapipe.solutions.hands.Hands = Mock(return_value=mock_hands)
    mock_mediapipe.solutions.hands.HAND_CONNECTIONS = []  # Mock the hand connections
    mock_mediapipe.solutions.drawing_utils = mock_drawing_utils
    mock_mediapipe.solutions.drawing_styles = mock_drawing_styles
    
    # Create and return the preprocessor
    preprocessor = HandPreprocessor()
    preprocessor.hands = mock_hands
    preprocessor.mp_drawing = mock_drawing_utils
    preprocessor.mp_drawing_styles = mock_drawing_styles
    preprocessor.mp_hands = mock_mediapipe.solutions.hands
    return preprocessor

@pytest.fixture
def mock_frame():
    # Create a mock frame with dimensions similar to the camera settings
    return np.zeros((settings.FRAME_HEIGHT, settings.FRAME_WIDTH, 3), dtype=np.uint8)

def test_hand_preprocessor_initialization(hand_preprocessor):
    # Verify the mock Hands instance was properly initialized
    assert isinstance(hand_preprocessor.hands, Mock)
    assert hand_preprocessor.hands.static_image_mode == False
    assert hand_preprocessor.hands.max_num_hands == settings.MAX_NUM_HANDS
    assert hand_preprocessor.hands.min_detection_confidence == settings.MIN_DETECTION_CONFIDENCE
    assert hand_preprocessor.hands.min_tracking_confidence == settings.MIN_TRACKING_CONFIDENCE

def test_process_frame_no_hands(hand_preprocessor, mock_frame):
    with patch('mediapipe.solutions.hands.Hands.process') as mock_process:
        mock_process.return_value.multi_hand_landmarks = None
        
        landmarks, vis_frame = hand_preprocessor.process_frame(mock_frame)
        
        assert landmarks is None
        assert isinstance(vis_frame, np.ndarray)
        assert vis_frame.shape == mock_frame.shape

def test_process_frame_with_hands(hand_preprocessor, mock_frame):
    # Create mock hand landmarks with proper attributes
    mock_landmarks = []
    for i in range(21):  # 21 landmarks
        landmark = Mock()
        landmark.x = 0.5
        landmark.y = 0.5
        landmark.z = 0.0
        mock_landmarks.append(landmark)

    # Create mock hand landmarks object
    mock_hand_landmarks = Mock()
    mock_hand_landmarks.landmark = mock_landmarks

    # Mock the process result
    mock_results = Mock()
    mock_results.multi_hand_landmarks = [mock_hand_landmarks]

    # ✅ Patch the process method on the instance itself
    hand_preprocessor.hands.process = Mock(return_value=mock_results)

    # Mock cv2.cvtColor to return the same frame
    with patch('cv2.cvtColor', return_value=mock_frame):
        # Patch drawing function
        hand_preprocessor.mp_drawing.draw_landmarks = Mock()

        # Call the method under test
        landmarks, vis_frame = hand_preprocessor.process_frame(mock_frame)

        # Assertions
        assert landmarks is not None
        assert isinstance(landmarks, np.ndarray)
        assert landmarks.shape == (63,)  # 21 landmarks * 3 coordinates
        assert isinstance(vis_frame, np.ndarray)
        assert vis_frame.shape == mock_frame.shape

def test_process_frame_invalid_input(hand_preprocessor):
    invalid_frame = "not an image"
    with patch('cv2.cvtColor', side_effect=ValueError("Invalid frame format")):
        landmarks, vis_frame = hand_preprocessor.process_frame(invalid_frame)
        assert landmarks is None
        assert isinstance(vis_frame, str)
        assert vis_frame == invalid_frame

if __name__ == "__main__":
    import pytest
    pytest.main([__file__])
