"""
Quick script to test database connection
Run this to verify your database is accessible
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config import settings
from sqlalchemy import create_engine, text

print("=" * 50)
print("Database Connection Test")
print("=" * 50)
print(f"Host: {settings.DB_HOST}")
print(f"User: {settings.DB_USER}")
print(f"Database: {settings.DB_NAME}")
print(f"Password: {'*' * len(settings.DB_PASS) if settings.DB_PASS else '(empty)'}")
print("-" * 50)

DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASS}"
    f"@{settings.DB_HOST}/{settings.DB_NAME}"
)

try:
    print("Attempting to connect...")
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args={
            "connect_timeout": 10,
            "charset": "utf8mb4"
        }
    )
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1 as test"))
        row = result.fetchone()
        if row and row[0] == 1:
            print("✅ Connection successful!")
            
            # Check if database exists
            conn.execute(text(f"USE {settings.DB_NAME}"))
            print(f"✅ Database '{settings.DB_NAME}' exists and is accessible")
            
            # Check if users table exists
            result = conn.execute(text("SHOW TABLES LIKE 'users'"))
            if result.fetchone():
                print("✅ 'users' table exists")
                
                # Count users
                result = conn.execute(text("SELECT COUNT(*) FROM users"))
                count = result.fetchone()[0]
                print(f"✅ Found {count} user(s) in database")
            else:
                print("⚠️  'users' table does not exist")
                print("   Run the application once to create tables, or run migrations")
        else:
            print("❌ Connection test failed")
            
except Exception as e:
    print(f"❌ Connection failed!")
    print(f"Error: {str(e)}")
    print("\n💡 Troubleshooting:")
    print("1. Make sure MySQL/MariaDB is running in XAMPP Control Panel")
    print("2. Check if database 'rag_jobs' exists:")
    print("   - Open phpMyAdmin (http://localhost/phpmyadmin)")
    print("   - Create database 'rag_jobs' if it doesn't exist")
    print("3. Verify DB_USER and DB_PASS in .env file (or use defaults)")
    print("4. For XAMPP, default root password is usually empty")
    sys.exit(1)

print("=" * 50)

