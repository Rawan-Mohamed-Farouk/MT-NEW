# Intrusion Detection System (IDS) Model

## 📁 Model Location

Place your intrusion detection model file in this directory.

## 🔧 Supported Formats

The system supports various model formats:
- **Pickle** (`.pkl`) - Python pickle files
- **Joblib** (`.joblib`) - Scikit-learn joblib files
- **TensorFlow** (`.h5`, `.pb`) - TensorFlow/Keras models
- **PyTorch** (`.pth`, `.pt`) - PyTorch models
- **ONNX** (`.onnx`) - ONNX models

## 📝 Configuration

Set the model path in your `.env` file:

```env
IDS_MODEL_PATH=models/ids_model.pkl
IDS_ENABLED=true
```

## 🚀 Integration

1. **Upload your model** to this directory
2. **Update `backend/src/utils/ids_detector.py`** to load your specific model format
3. **Customize feature extraction** in `extract_features()` function
4. **Test the detection** using the `/security/detect` endpoint

## 📊 Model Requirements

Your model should:
- Accept feature vectors as input
- Return threat classification (threat/no threat)
- Optionally return confidence scores
- Support real-time inference

## 🔍 Feature Extraction

Modify `extract_features()` in `ids_detector.py` to match your model's expected input format.

## 📡 API Endpoint

Your model can report threats via:
```
POST /security/detect
{
  "threat_type": "sql_injection",
  "severity": "critical",
  "details": "Detected SQL injection pattern",
  "user_id": 123,
  "blocked": true
}
```

## 🛡️ Automatic Detection

Enable automatic detection by uncommenting the SecurityMiddleware in `main.py`:
```python
from backend.src.middleware.security_middleware import SecurityMiddleware
app.add_middleware(SecurityMiddleware)
```

