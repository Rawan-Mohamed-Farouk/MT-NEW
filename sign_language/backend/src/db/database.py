from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError, DatabaseError
from fastapi import HTTPException

# Flexible import so scripts can run both from project root and backend/
try:
    from backend.src.config import settings  # when imported as package from repo root
except ImportError:  # pragma: no cover - fallback for script execution
    from src.config import settings


DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASS}"
    f"@{settings.DB_HOST}/{settings.DB_NAME}"
)

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,    # Recycle connections after 1 hour
    pool_size=10,         # Number of connections to maintain
    max_overflow=20,     # Maximum overflow connections
    connect_args={
        "connect_timeout": 10,
        "charset": "utf8mb4"
    }
)

# Test connection on startup (non-blocking)
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database connection successful")
except OperationalError as e:
    print(f"\n⚠️  Database Connection Warning:")
    print(f"   Cannot connect to MySQL database at {settings.DB_HOST}")
    print(f"   Database: {settings.DB_NAME}")
    print(f"   User: {settings.DB_USER}")
    print(f"   Error: {str(e)}")
    print(f"\n💡 Troubleshooting:")
    print(f"   1. Make sure MySQL/MariaDB is running (check XAMPP Control Panel)")
    print(f"   2. Check DB_HOST, DB_USER, DB_PASS, DB_NAME in .env file")
    print(f"   3. Verify database '{settings.DB_NAME}' exists")
    print(f"   4. Check firewall/network settings")
    print(f"\n   The application will start, but database operations may fail.")
    print(f"   Please fix the database connection and restart.\n")
except Exception as e:
    print(f"\n⚠️  Database Connection Warning: {str(e)}")
    print(f"   The application will start, but database operations may fail.\n")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Get database session with error handling"""
    db = SessionLocal()
    try:
        yield db
    except OperationalError as e:
        db.rollback()
        error_msg = str(e)
        print(f"Database connection error: {error_msg}")
        # Provide helpful error message
        if "Access denied" in error_msg:
            raise HTTPException(
                status_code=503,
                detail="Database authentication failed. Please check DB_USER and DB_PASS in .env file"
            )
        elif "Unknown database" in error_msg or "doesn't exist" in error_msg:
            raise HTTPException(
                status_code=503,
                detail=f"Database '{settings.DB_NAME}' not found. Please create it first."
            )
        elif "Can't connect" in error_msg or "Connection refused" in error_msg:
            raise HTTPException(
                status_code=503,
                detail=f"Cannot connect to database at {settings.DB_HOST}. Make sure MySQL/MariaDB is running."
            )
        else:
            raise HTTPException(
                status_code=503,
                detail=f"Database error: {error_msg}"
            )
    except Exception as e:
        db.rollback()
        print(f"Database error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while accessing the database: {str(e)}"
        )
    finally:
        db.close()

