"""
Migration script to add new columns to disabilities table
Run: python migrate_disabilities.py
"""
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend path on PYTHONPATH for flexible imports
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import text

# Flexible import: works when running inside backend/ or repo root
try:
    from src.db.database import engine
except ImportError:  # pragma: no cover
    from backend.src.db.database import engine

def migrate_disabilities():
    """Add new columns to disabilities table"""
    print("=" * 60)
    print("Migrating Disabilities Table")
    print("=" * 60)
    
    with engine.connect() as conn:
        try:
            # Check if columns exist
            result = conn.execute(text("SHOW COLUMNS FROM disabilities"))
            columns = [row[0] for row in result]
            
            # Add description column if it doesn't exist
            if 'description' not in columns:
                print("Adding 'description' column...")
                conn.execute(text("ALTER TABLE disabilities ADD COLUMN description TEXT"))
                conn.commit()
                print("✅ Added 'description' column")
            else:
                print("⏭️  'description' column already exists")
            
            # Add category column if it doesn't exist
            if 'category' not in columns:
                print("Adding 'category' column...")
                conn.execute(text("ALTER TABLE disabilities ADD COLUMN category VARCHAR(100)"))
                conn.commit()
                print("✅ Added 'category' column")
            else:
                print("⏭️  'category' column already exists")
            
            # Add icon column if it doesn't exist
            if 'icon' not in columns:
                print("Adding 'icon' column...")
                conn.execute(text("ALTER TABLE disabilities ADD COLUMN icon VARCHAR(100)"))
                conn.commit()
                print("✅ Added 'icon' column")
            else:
                print("⏭️  'icon' column already exists")
            
            # Add created_at column if it doesn't exist
            if 'created_at' not in columns:
                print("Adding 'created_at' column...")
                conn.execute(text("ALTER TABLE disabilities ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
                conn.commit()
                print("✅ Added 'created_at' column")
            else:
                print("⏭️  'created_at' column already exists")
            
            print("=" * 60)
            print("✅ Migration completed successfully!")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    migrate_disabilities()

