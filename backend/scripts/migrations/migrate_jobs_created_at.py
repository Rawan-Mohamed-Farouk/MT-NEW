"""
Migration: Add created_at column to jobs table
Run this if your jobs table doesn't have a created_at column
"""
import sys
import os

# Add parent directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, text
import sys
import os

# Try to import settings
try:
    from src.config import settings
except ImportError:
    # Fallback: read from environment or use defaults
    from dotenv import load_dotenv
    load_dotenv()
    
    class Settings:
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_USER = os.getenv("DB_USER", "root")
        DB_PASS = os.getenv("DB_PASS", "")
        DB_NAME = os.getenv("DB_NAME", "rag_jobs")
    
    settings = Settings()

DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASS}"
    f"@{settings.DB_HOST}/{settings.DB_NAME}"
)

def migrate():
    print("=" * 50)
    print("Migration: Add created_at to jobs table")
    print("=" * 50)
    
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT COUNT(*) 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = :db_name 
                AND TABLE_NAME = 'jobs' 
                AND COLUMN_NAME = 'created_at'
            """), {"db_name": settings.DB_NAME})
            
            exists = result.fetchone()[0] > 0
            
            if exists:
                print("✅ Column 'created_at' already exists in jobs table")
            else:
                print("Adding 'created_at' column to jobs table...")
                # Add the column with a default value for existing rows
                conn.execute(text("""
                    ALTER TABLE jobs 
                    ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                """))
                conn.commit()
                print("✅ Successfully added 'created_at' column to jobs table")
                
                # Update existing rows to have a timestamp
                conn.execute(text("""
                    UPDATE jobs 
                    SET created_at = CURRENT_TIMESTAMP 
                    WHERE created_at IS NULL
                """))
                conn.commit()
                print("✅ Updated existing rows with current timestamp")
        
        print("=" * 50)
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()

