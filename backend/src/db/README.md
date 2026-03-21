# Database Layer

## 📁 Files

### `database.py`
- Database connection configuration
- SQLAlchemy engine setup
- Session management
- Base class for models

### `models.py`
SQLAlchemy ORM models:

#### Core Models
- **User**: User accounts with profile information
- **Disability**: Disability types and categories
- **Skill**: Skills database
- **Company**: Company information
- **Location**: Location data

#### Job Models
- **Job**: Job listings
- **JobRequirement**: Job requirements
- **JobApplication**: User job applications

#### Support Models
- **AssistiveTool**: Assistive tools and resources
- **ConversationLog**: Chat conversation history
- **ActivityLog**: System activity tracking

#### Association Tables
- `user_disabilities`: User-Disability many-to-many
- `user_skills`: User-Skill many-to-many
- `job_disability_support`: Job-Disability many-to-many
- `disability_tools`: Disability-Tool many-to-many

## 🔗 Relationships

- Users ↔ Disabilities (many-to-many)
- Users ↔ Skills (many-to-many)
- Jobs ↔ Disabilities (many-to-many)
- Jobs ↔ Requirements (one-to-many)
- Jobs ↔ Applications (one-to-many)
- Disabilities ↔ Tools (many-to-many)

## 📊 Database Schema

All tables are automatically created by SQLAlchemy when the application starts.

## 🔧 Usage

```python
from backend.src.db.database import get_db
from backend.src.db import models

# Get database session
db = next(get_db())

# Query users
users = db.query(models.User).all()

# Create new user
user = models.User(name="John", email="john@example.com")
db.add(user)
db.commit()
```

