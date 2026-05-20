"""
Migration script to create assistive_tools table
Run: python migrate_tools.py
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

def migrate_tools():
    """Create assistive_tools table and disability_tools association table"""
    print("=" * 60)
    print("Creating Assistive Tools Tables")
    print("=" * 60)
    
    with engine.connect() as conn:
        try:
            # Create assistive_tools table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS assistive_tools (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    category VARCHAR(100),
                    tool_type VARCHAR(100),
                    platform VARCHAR(100),
                    cost VARCHAR(50),
                    website_url VARCHAR(500),
                    icon VARCHAR(100),
                    features JSON,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✅ Created 'assistive_tools' table")
            
            # Create disability_tools association table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS disability_tools (
                    disability_id INT,
                    tool_id INT,
                    PRIMARY KEY (disability_id, tool_id),
                    FOREIGN KEY (disability_id) REFERENCES disabilities(id) ON DELETE CASCADE,
                    FOREIGN KEY (tool_id) REFERENCES assistive_tools(id) ON DELETE CASCADE
                )
            """))
            conn.commit()
            print("✅ Created 'disability_tools' association table")
            
            print("=" * 60)
            print("✅ Migration completed successfully!")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    migrate_tools()

