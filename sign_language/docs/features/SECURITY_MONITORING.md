# Security Monitoring & Intrusion Detection System

## 🛡️ Overview

The EmpowerWork platform includes comprehensive security monitoring and intrusion detection capabilities to protect against various cyber threats.

## ✨ Features

### 1. Security Logging
- **Automatic Logging**: All security events are automatically logged
- **Threat Classification**: Logs are categorized by severity (info, warning, critical)
- **Threat Types**: SQL injection, XSS, brute force, rate limiting, suspicious activity
- **IP Tracking**: All requests are tracked by IP address
- **User Association**: Security events can be linked to specific users

### 2. Intrusion Detection System (IDS)
- **Model Integration**: Support for custom ML-based intrusion detection models
- **Rule-Based Detection**: Fallback rule-based detection for common attack patterns
- **Real-Time Analysis**: Requests are analyzed in real-time
- **Automatic Blocking**: Critical threats are automatically blocked

### 3. Security Dashboard
- **Real-Time Monitoring**: View security logs in real-time
- **Statistics**: Security statistics and threat distribution
- **Filtering**: Filter logs by severity, threat type, date range
- **Threat Visualization**: Visual representation of security threats

## 📊 Security Logs

### Log Fields
- **ID**: Unique log identifier
- **User ID**: Associated user (if applicable)
- **IP Address**: Client IP address
- **Action**: Request action (login_attempt, suspicious_activity, etc.)
- **Severity**: info, warning, or critical
- **Threat Type**: Type of threat detected
- **Details**: Detailed information about the threat
- **Detected By**: Detection method (system, ids_model, manual)
- **Blocked**: Whether the request was blocked
- **Timestamp**: When the event occurred

## 🔧 IDS Model Integration

### Step 1: Upload Your Model
1. Place your IDS model file in `backend/models/` directory
2. Supported formats: `.pkl`, `.joblib`, `.h5`, `.pth`, `.onnx`

### Step 2: Configure Model Path
Add to your `.env` file:
```env
IDS_MODEL_PATH=models/your_model.pkl
IDS_ENABLED=true
```

### Step 3: Customize Model Loading
Edit `backend/src/utils/ids_detector.py`:
- Update `load_ids_model()` to load your specific model format
- Modify `extract_features()` to match your model's input requirements
- Adjust `detect_threat()` to process your model's output

### Step 4: Enable Automatic Detection
Uncomment in `backend/src/main.py`:
```python
from backend.src.middleware.security_middleware import SecurityMiddleware
app.add_middleware(SecurityMiddleware)
```

## 📡 API Endpoints

### Get Security Logs
```
GET /security/logs?limit=100&offset=0&severity=critical&threat_type=sql_injection
```

### Get Security Statistics
```
GET /security/stats?days=7
```

### Report Threat (for IDS model)
```
POST /security/detect
{
  "threat_type": "sql_injection",
  "severity": "critical",
  "details": "Detected SQL injection pattern",
  "user_id": 123,
  "blocked": true,
  "action": "suspicious_activity"
}
```

### Delete Security Log
```
DELETE /security/logs/{log_id}
```

## 🎯 Threat Detection

### Detected Threat Types
- **SQL Injection**: Detects SQL injection attempts
- **XSS Attacks**: Detects cross-site scripting attempts
- **Brute Force**: Detects brute force login attempts
- **Rate Limiting**: Tracks rate limit violations
- **Suspicious Activity**: General suspicious patterns
- **Path Traversal**: Detects directory traversal attempts
- **Command Injection**: Detects command injection attempts

### Rule-Based Detection Patterns
The system includes built-in pattern matching for:
- SQL injection keywords
- XSS script tags and event handlers
- Path traversal sequences
- Command injection patterns

## 📈 Security Dashboard Features

### Statistics Cards
- **Total Logs**: Number of security events in the last 7 days
- **Critical Threats**: Number of critical security events
- **Blocked Attempts**: Number of successfully blocked attacks
- **System Status**: Overall system security status

### Log Table
- Sortable columns
- Real-time updates
- Filter by severity and threat type
- Delete individual logs
- Detailed threat information

### Threat Distribution
- Visual breakdown of threat types
- Count per threat category
- Easy identification of common attack vectors

## 🔒 Security Best Practices

1. **Regular Monitoring**: Check security logs regularly
2. **Model Updates**: Keep your IDS model updated
3. **Log Retention**: Archive old logs periodically
4. **Alert Configuration**: Set up alerts for critical threats
5. **IP Blocking**: Manually block persistent attackers

## 🚨 Alert Levels

- **Info**: Normal security events, informational only
- **Warning**: Suspicious activity that should be reviewed
- **Critical**: Immediate threat requiring action

## 📝 Notes

- Security logs are stored in the `security_logs` database table
- The IDS model integration is flexible and supports various ML frameworks
- Automatic blocking can be enabled/disabled via middleware
- All security events are timestamped and logged for audit purposes

