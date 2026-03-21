# 📡 API Documentation

EmpowerWork Backend API Reference

**Base URL**: `https://your-backend.modal.run`

---

## Endpoints

### Health Check

```http
GET /health
```

**Response**
```json
{
  "status": "ok",
  "message": "EmpowerWork API is running"
}
```

---

### AI Chat

```http
POST /chat
Content-Type: application/json

{
  "message": "Hello, how can you help?"
}
```

**Response**
```json
{
  "response": "I'm EmpowerBot, here to help..."
}
```

**Status Codes**
- `200` - Success
- `400` - Missing message
- `500` - Server error

---

### Image Detection

```http
POST /detect
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg"
}
```

OR

```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AA..."
}
```

**Response**
```json
{
  "detection": "ASL sign detected",
  "confidence": 0.95,
  "bounding_box": [...]
}
```

---

### Live Frame Detection

```http
POST /detect-frame
Content-Type: application/json

{
  "frame": "data:image/jpeg;base64,/9j/4AA..."
}
```

**Response**
```json
{
  "detected": true,
  "sign": "hello",
  "confidence": 0.88
}
```

---

### Video Prediction

```http
POST /predict-video
Content-Type: multipart/form-data

file: [video file]
```

**Response**
```json
{
  "status": "processed",
  "predictions": [
    {"frame": 1, "sign": "hello", "confidence": 0.9},
    {"frame": 30, "sign": "world", "confidence": 0.85}
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

---

## Rate Limits

- Chat: 100 requests/hour
- Detection: 50 requests/hour
- Video: 10 requests/hour

---

## Authentication

Currently: None (future: JWT tokens)

```http
Authorization: Bearer <token>
```

---

*Last updated: January 2025*

