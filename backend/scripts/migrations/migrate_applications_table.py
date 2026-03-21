"""
Migration script to add new columns to job_applications table
Run this once to update the database schema
"""
import sys
import os
import pymysql

# Flexible import path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
repo_root = os.path.dirname(backend_dir)
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

try:
    from src.config import settings
except ImportError:  # pragma: no cover
    from backend.src.config import settings

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

def migrate_database():
    """Add new columns to job_applications table"""
    connection = None
    try:
        # Connect to database
        connection = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASS,
            database=settings.DB_NAME,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        print("Checking job_applications table structure...")
        
        # Check if columns exist
        cursor.execute("SHOW COLUMNS FROM job_applications LIKE 'cv_path'")
        cv_path_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM job_applications LIKE 'manual_info'")
        manual_info_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM job_applications LIKE 'cv_file_path'")
        cv_file_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM job_applications LIKE 'cv_extracted_info'")
        cv_info_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM job_applications LIKE 'admin_notes'")
        admin_notes_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM job_applications LIKE 'reviewed_at'")
        reviewed_at_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM job_applications LIKE 'reviewed_by'")
        reviewed_by_exists = cursor.fetchone()
        
        # Add missing columns
        if not cv_path_exists:
            print("Adding cv_path column...")
            cursor.execute("ALTER TABLE job_applications ADD COLUMN cv_path VARCHAR(500) NULL AFTER cover_letter")
            print("OK Added cv_path")
        else:
            print("cv_path column already exists")
        
        if not manual_info_exists:
            print("Adding manual_info column...")
            cursor.execute("ALTER TABLE job_applications ADD COLUMN manual_info TEXT NULL AFTER cv_path")
            print("OK Added manual_info")
        else:
            print("manual_info column already exists")
        
        if not cv_file_exists:
            print("Adding cv_file_path column...")
            cursor.execute("ALTER TABLE job_applications ADD COLUMN cv_file_path VARCHAR(500) NULL AFTER cv_path")
            print("OK Added cv_file_path")
        else:
            print("cv_file_path column already exists")
        
        if not cv_info_exists:
            print("Adding cv_extracted_info column...")
            cursor.execute("ALTER TABLE job_applications ADD COLUMN cv_extracted_info JSON NULL AFTER cv_file_path")
            print("OK Added cv_extracted_info")
        else:
            print("cv_extracted_info column already exists")
        
        if not admin_notes_exists:
            print("Adding admin_notes column...")
            cursor.execute("ALTER TABLE job_applications ADD COLUMN admin_notes TEXT NULL AFTER status")
            print("OK Added admin_notes")
        else:
            print("admin_notes column already exists")
        
        if not reviewed_at_exists:
            print("Adding reviewed_at column...")
            cursor.execute("ALTER TABLE job_applications ADD COLUMN reviewed_at DATETIME NULL AFTER admin_notes")
            print("OK Added reviewed_at")
        else:
            print("reviewed_at column already exists")
        
        if not reviewed_by_exists:
            print("Adding reviewed_by column...")
            cursor.execute("ALTER TABLE job_applications ADD COLUMN reviewed_by INT NULL AFTER reviewed_at")
            try:
                cursor.execute("ALTER TABLE job_applications ADD FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL")
            except Exception as fk_error:
                print(f"Note: Foreign key constraint: {fk_error}")
            print("OK Added reviewed_by")
        else:
            print("reviewed_by column already exists")
        
        connection.commit()
        print("\nSUCCESS: Migration completed successfully!")
        
    except Exception as e:
        print(f"ERROR: Error during migration: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    migrate_database()
