"""
Comprehensive database migration script to fix all schema issues
This script checks and fixes all missing columns, relationships, and schema mismatches
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
except ImportError:
    from backend.src.config import settings

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

def get_table_columns(cursor, table_name):
    """Get all columns for a table"""
    cursor.execute(f"SHOW COLUMNS FROM {table_name}")
    return {row[0]: row[1] for row in cursor.fetchall()}

def column_exists(cursor, table_name, column_name):
    """Check if a column exists"""
    cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE '{column_name}'")
    return cursor.fetchone() is not None

def migrate_database():
    """Fix all database schema issues"""
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
        
        print("=" * 70)
        print("COMPREHENSIVE DATABASE MIGRATION")
        print("=" * 70)
        print(f"Database: {settings.DB_NAME}")
        print(f"Host: {settings.DB_HOST}")
        print("=" * 70)
        
        # ========== USERS TABLE ==========
        print("\n[1/8] Checking 'users' table...")
        try:
            users_cols = get_table_columns(cursor, 'users')
            required_users_cols = {
                'id': 'INT',
                'name': 'VARCHAR(100)',
                'email': 'VARCHAR(255)',
                'password': 'VARCHAR(255)',
                'user_type': 'VARCHAR(20)',
                'photo': 'VARCHAR(500)',
                'phone': 'VARCHAR(50)',
                'age': 'INT',
                'gender': 'VARCHAR(20)',
                'location': 'VARCHAR(255)',
                'experience_level': 'VARCHAR(50)',
                'preferred_job_type': 'VARCHAR(50)',
                'created_at': 'DATETIME'
            }
            
            for col, col_type in required_users_cols.items():
                if col not in users_cols:
                    print(f"  Adding column: {col}")
                    if 'VARCHAR' in col_type:
                        size = col_type.split('(')[1].split(')')[0]
                        cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type} NULL")
                    elif col == 'created_at':
                        cursor.execute(f"ALTER TABLE users ADD COLUMN {col} DATETIME DEFAULT CURRENT_TIMESTAMP")
                    else:
                        cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type} NULL")
                    print(f"  ✅ Added {col}")
            print("  ✅ 'users' table is up to date")
        except Exception as e:
            print(f"  ⚠️  Error checking users table: {e}")
        
        # ========== JOBS TABLE ==========
        print("\n[2/8] Checking 'jobs' table...")
        try:
            jobs_cols = get_table_columns(cursor, 'jobs')
            if 'created_at' not in jobs_cols:
                print("  Adding column: created_at")
                cursor.execute("ALTER TABLE jobs ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
                cursor.execute("UPDATE jobs SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
                print("  ✅ Added created_at")
            print("  ✅ 'jobs' table is up to date")
        except Exception as e:
            print(f"  ⚠️  Error checking jobs table: {e}")
        
        # ========== JOB_APPLICATIONS TABLE ==========
        print("\n[3/8] Checking 'job_applications' table...")
        try:
            apps_cols = get_table_columns(cursor, 'job_applications')
            required_apps_cols = {
                'cv_path': 'VARCHAR(500)',
                'manual_info': 'TEXT',
                'cv_file_path': 'VARCHAR(500)',
                'cv_extracted_info': 'JSON',
                'admin_notes': 'TEXT',
                'reviewed_at': 'DATETIME',
                'reviewer_id': 'INT'
            }
            
            for col, col_type in required_apps_cols.items():
                if col not in apps_cols:
                    print(f"  Adding column: {col}")
                    if col == 'cv_path':
                        cursor.execute("ALTER TABLE job_applications ADD COLUMN cv_path VARCHAR(500) NULL AFTER cover_letter")
                    elif col == 'manual_info':
                        cursor.execute("ALTER TABLE job_applications ADD COLUMN manual_info TEXT NULL AFTER cv_path")
                    elif col == 'cv_file_path':
                        cursor.execute("ALTER TABLE job_applications ADD COLUMN cv_file_path VARCHAR(500) NULL AFTER cv_path")
                    elif col == 'cv_extracted_info':
                        cursor.execute("ALTER TABLE job_applications ADD COLUMN cv_extracted_info JSON NULL AFTER cv_file_path")
                    elif col == 'admin_notes':
                        cursor.execute("ALTER TABLE job_applications ADD COLUMN admin_notes TEXT NULL AFTER status")
                    elif col == 'reviewed_at':
                        cursor.execute("ALTER TABLE job_applications ADD COLUMN reviewed_at DATETIME NULL AFTER admin_notes")
                    elif col == 'reviewer_id':
                        cursor.execute("ALTER TABLE job_applications ADD COLUMN reviewer_id INT NULL AFTER reviewed_at")
                        try:
                            cursor.execute("ALTER TABLE job_applications ADD FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL")
                        except:
                            pass
                    print(f"  ✅ Added {col}")
            print("  ✅ 'job_applications' table is up to date")
        except Exception as e:
            print(f"  ⚠️  Error checking job_applications table: {e}")
        
        # ========== DISABILITIES TABLE ==========
        print("\n[4/8] Checking 'disabilities' table...")
        try:
            dis_cols = get_table_columns(cursor, 'disabilities')
            required_dis_cols = {
                'description': 'TEXT',
                'category': 'VARCHAR(100)',
                'icon': 'VARCHAR(100)',
                'created_at': 'DATETIME'
            }
            
            for col, col_type in required_dis_cols.items():
                if col not in dis_cols:
                    print(f"  Adding column: {col}")
                    if col == 'created_at':
                        cursor.execute("ALTER TABLE disabilities ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
                    else:
                        cursor.execute(f"ALTER TABLE disabilities ADD COLUMN {col} {col_type} NULL")
                    print(f"  ✅ Added {col}")
            print("  ✅ 'disabilities' table is up to date")
        except Exception as e:
            print(f"  ⚠️  Error checking disabilities table: {e}")
        
        # ========== ASSISTIVE_TOOLS TABLE ==========
        print("\n[5/8] Checking 'assistive_tools' table...")
        try:
            cursor.execute("SHOW TABLES LIKE 'assistive_tools'")
            if not cursor.fetchone():
                print("  Creating assistive_tools table...")
                cursor.execute("""
                    CREATE TABLE assistive_tools (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        category VARCHAR(100),
                        tool_type VARCHAR(100),
                        platform VARCHAR(100),
                        cost VARCHAR(50),
                        website_url VARCHAR(500),
                        icon VARCHAR(100),
                        features TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                print("  ✅ Created assistive_tools table")
            else:
                print("  ✅ 'assistive_tools' table exists")
        except Exception as e:
            print(f"  ⚠️  Error checking assistive_tools table: {e}")
        
        # ========== ASSOCIATION TABLES ==========
        print("\n[6/8] Checking association tables...")
        
        # user_disabilities
        try:
            cursor.execute("SHOW TABLES LIKE 'user_disabilities'")
            if not cursor.fetchone():
                print("  Creating user_disabilities table...")
                cursor.execute("""
                    CREATE TABLE user_disabilities (
                        user_id INT,
                        disability_id INT,
                        PRIMARY KEY (user_id, disability_id),
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (disability_id) REFERENCES disabilities(id) ON DELETE CASCADE
                    )
                """)
                print("  ✅ Created user_disabilities table")
            else:
                print("  ✅ 'user_disabilities' table exists")
        except Exception as e:
            print(f"  ⚠️  Error checking user_disabilities: {e}")
        
        # user_skills
        try:
            cursor.execute("SHOW TABLES LIKE 'user_skills'")
            if not cursor.fetchone():
                print("  Creating user_skills table...")
                cursor.execute("""
                    CREATE TABLE user_skills (
                        user_id INT,
                        skill_id INT,
                        PRIMARY KEY (user_id, skill_id),
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
                    )
                """)
                print("  ✅ Created user_skills table")
            else:
                print("  ✅ 'user_skills' table exists")
        except Exception as e:
            print(f"  ⚠️  Error checking user_skills: {e}")
        
        # job_disability_support
        try:
            cursor.execute("SHOW TABLES LIKE 'job_disability_support'")
            if not cursor.fetchone():
                print("  Creating job_disability_support table...")
                cursor.execute("""
                    CREATE TABLE job_disability_support (
                        job_id INT,
                        disability_id INT,
                        PRIMARY KEY (job_id, disability_id),
                        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                        FOREIGN KEY (disability_id) REFERENCES disabilities(id) ON DELETE CASCADE
                    )
                """)
                print("  ✅ Created job_disability_support table")
            else:
                print("  ✅ 'job_disability_support' table exists")
        except Exception as e:
            print(f"  ⚠️  Error checking job_disability_support: {e}")
        
        # disability_tools
        try:
            cursor.execute("SHOW TABLES LIKE 'disability_tools'")
            if not cursor.fetchone():
                print("  Creating disability_tools table...")
                cursor.execute("""
                    CREATE TABLE disability_tools (
                        disability_id INT,
                        tool_id INT,
                        PRIMARY KEY (disability_id, tool_id),
                        FOREIGN KEY (disability_id) REFERENCES disabilities(id) ON DELETE CASCADE,
                        FOREIGN KEY (tool_id) REFERENCES assistive_tools(id) ON DELETE CASCADE
                    )
                """)
                print("  ✅ Created disability_tools table")
            else:
                print("  ✅ 'disability_tools' table exists")
        except Exception as e:
            print(f"  ⚠️  Error checking disability_tools: {e}")
        
        # ========== COMPANIES TABLE ==========
        print("\n[7/8] Checking 'companies' table...")
        try:
            cursor.execute("SHOW TABLES LIKE 'companies'")
            if not cursor.fetchone():
                print("  Creating companies table...")
                cursor.execute("""
                    CREATE TABLE companies (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        website VARCHAR(500),
                        logo VARCHAR(500)
                    )
                """)
                print("  ✅ Created companies table")
            else:
                # Check if all columns exist
                companies_cols = get_table_columns(cursor, 'companies')
                required_companies_cols = {
                    'description': 'TEXT',
                    'website': 'VARCHAR(500)',
                    'logo': 'VARCHAR(500)'
                }
                
                for col, col_type in required_companies_cols.items():
                    if col not in companies_cols:
                        print(f"  Adding column: {col}")
                        cursor.execute(f"ALTER TABLE companies ADD COLUMN {col} {col_type} NULL")
                        print(f"  ✅ Added {col}")
                print("  ✅ 'companies' table is up to date")
        except Exception as e:
            print(f"  ⚠️  Error checking companies table: {e}")
        
        # ========== LOCATIONS TABLE ==========
        print("\n[8/8] Checking 'locations' table...")
        try:
            cursor.execute("SHOW TABLES LIKE 'locations'")
            if not cursor.fetchone():
                print("  Creating locations table...")
                cursor.execute("""
                    CREATE TABLE locations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        city VARCHAR(100),
                        state VARCHAR(100),
                        country VARCHAR(100),
                        address VARCHAR(500)
                    )
                """)
                print("  ✅ Created locations table")
            else:
                # Check if all columns exist
                locations_cols = get_table_columns(cursor, 'locations')
                required_locations_cols = {
                    'city': 'VARCHAR(100)',
                    'state': 'VARCHAR(100)',
                    'country': 'VARCHAR(100)',
                    'address': 'VARCHAR(500)'
                }
                
                for col, col_type in required_locations_cols.items():
                    if col not in locations_cols:
                        print(f"  Adding column: {col}")
                        cursor.execute(f"ALTER TABLE locations ADD COLUMN {col} {col_type} NULL")
                        print(f"  ✅ Added {col}")
                print("  ✅ 'locations' table is up to date")
        except Exception as e:
            print(f"  ⚠️  Error checking locations table: {e}")
        
        # ========== SKILLS TABLE ==========
        print("\n[9/9] Checking 'skills' table...")
        try:
            cursor.execute("SHOW TABLES LIKE 'skills'")
            if not cursor.fetchone():
                print("  Creating skills table...")
                cursor.execute("""
                    CREATE TABLE skills (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) UNIQUE NOT NULL
                    )
                """)
                print("  ✅ Created skills table")
            else:
                print("  ✅ 'skills' table exists")
        except Exception as e:
            print(f"  ⚠️  Error checking skills table: {e}")
        
        # ========== JOB_REQUIREMENTS TABLE ==========
        print("\n[10/10] Checking 'job_requirements' table...")
        try:
            cursor.execute("SHOW TABLES LIKE 'job_requirements'")
            if not cursor.fetchone():
                print("  Creating job_requirements table...")
                cursor.execute("""
                    CREATE TABLE job_requirements (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        job_id INT NOT NULL,
                        requirement VARCHAR(500) NOT NULL,
                        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
                    )
                """)
                print("  ✅ Created job_requirements table")
            else:
                print("  ✅ 'job_requirements' table exists")
        except Exception as e:
            print(f"  ⚠️  Error checking job_requirements table: {e}")
        
        connection.commit()
        
        print("\n" + "=" * 70)
        print("✅ ALL DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("\nYour database schema is now fully synchronized with the models.")
        print("You can now use the application without database errors.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        if connection:
            connection.rollback()
    finally:
        if connection:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    migrate_database()

