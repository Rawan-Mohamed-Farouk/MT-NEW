# Database Documentation

This directory contains comprehensive database documentation for the EmpowerWork project.

## Files

### 1. `DDL.sql` - Data Definition Language
Complete SQL script to create all database tables, indexes, and constraints.

**Usage:**
```bash
mysql -u root -p < DDL.sql
```

Or in MySQL/MariaDB:
```sql
SOURCE docs/database/DDL.sql;
```

### 2. `DML.sql` - Data Manipulation Language
Sample data insertion scripts including:
- Common disabilities (25+ types)
- Skills (technical and soft skills)
- Sample companies
- Sample locations
- Sample jobs with requirements
- Job-disability support associations
- Assistive tools (12+ tools)
- Disability-tool associations

**Usage:**
```bash
mysql -u root -p rag_jobs < DML.sql
```

Or in MySQL/MariaDB:
```sql
USE rag_jobs;
SOURCE docs/database/DML.sql;
```

### 3. `DATABASE_SCHEMA.md` - Schema Documentation
Complete database schema documentation including:
- Entity Relationship Diagram (text-based)
- Table descriptions
- Field specifications
- Relationships and foreign keys
- Indexes and constraints
- Data types and usage notes

## Quick Setup

### Option 1: Using SQL Scripts

1. **Create Database and Tables:**
   ```bash
   mysql -u root -p < docs/database/DDL.sql
   ```

2. **Insert Sample Data:**
   ```bash
   mysql -u root -p rag_jobs < docs/database/DML.sql
   ```

### Option 2: Using Python/SQLAlchemy

The database tables are automatically created when you start the FastAPI application:

```bash
python run_backend.py
```

Then run seed scripts:
```bash
python backend/scripts/seeds/seed_disabilities.py
python backend/scripts/seeds/seed_assistive_tools.py
python backend/scripts/seeds/seed_jobs.py
```

## Database Structure

### Main Tables (12)
1. `users` - User accounts
2. `disabilities` - Disability types
3. `skills` - Skills database
4. `companies` - Company information
5. `locations` - Location data
6. `jobs` - Job listings
7. `job_requirements` - Job requirements
8. `job_applications` - Job applications
9. `assistive_tools` - Assistive tools
10. `conversation_logs` - Chat logs
11. `activity_log` - Activity logs
12. `security_logs` - Security logs

### Association Tables (4)
1. `user_disabilities` - User-Disability mapping
2. `user_skills` - User-Skill mapping
3. `job_disability_support` - Job-Disability mapping
4. `disability_tools` - Disability-Tool mapping

## Database Configuration

The database connection is configured in `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=rag_jobs
```

## Important Notes

1. **Passwords**: Always hash passwords using Werkzeug/bcrypt before storing
2. **JSON Fields**: `cv_extracted_info` stores JSON as TEXT - parse using JSON functions
3. **File Paths**: Store relative paths from project root (e.g., `uploads/profiles/photo.jpg`)
4. **Timestamps**: All `created_at` fields use `CURRENT_TIMESTAMP` as default
5. **Cascade Deletes**: Association tables use `ON DELETE CASCADE` for data integrity

## Backup and Restore

### Backup:
```bash
mysqldump -u root -p rag_jobs > backup.sql
```

### Restore:
```bash
mysql -u root -p rag_jobs < backup.sql
```

## Migration Scripts

Database migration scripts are located in:
- `backend/scripts/migrations/`

Run migrations:
```bash
python backend/scripts/migrations/migrate_disabilities.py
python backend/scripts/migrations/migrate_tools.py
python backend/scripts/migrations/migrate_applications_table.py
```

## Seed Scripts

Data seeding scripts are located in:
- `backend/scripts/seeds/`

Run seeds:
```bash
python backend/scripts/seeds/seed_disabilities.py
python backend/scripts/seeds/seed_assistive_tools.py
python backend/scripts/seeds/seed_jobs.py
```

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL/MariaDB is running (check XAMPP Control Panel)
2. Verify database `rag_jobs` exists
3. Check `.env` file has correct credentials
4. Test connection: `mysql -u root -p -e "USE rag_jobs; SELECT 1;"`

### Table Creation Issues
1. Ensure database exists: `CREATE DATABASE rag_jobs;`
2. Check user permissions
3. Verify character set: `SHOW CREATE DATABASE rag_jobs;`

### Foreign Key Issues
1. Ensure parent tables exist before creating child tables
2. Check foreign key constraints: `SHOW CREATE TABLE table_name;`
3. Verify referenced columns exist and have correct data types

## Related Documentation

- [Backend Database README](../../backend/src/db/README.md)
- [Database Models](../../backend/src/db/models.py)
- [Database Connection](../../backend/src/db/database.py)

