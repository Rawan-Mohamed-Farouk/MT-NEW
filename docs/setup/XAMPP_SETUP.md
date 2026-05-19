# XAMPP MySQL Database Setup Guide

This guide will help you set up the database in XAMPP for the EmpowerWork application.

## Prerequisites

- XAMPP installed and running
- MySQL/MariaDB service started in XAMPP Control Panel

## Step 1: Create Database

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click "New" to create a new database
3. Database name: `rag_jobs`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

## Step 2: Configure Environment

1. Copy `env.example` to `.env` in the project root
2. Update `.env` with your XAMPP MySQL settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=          # Leave empty if no password set
DB_NAME=rag_jobs
```

## Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- fastapi
- uvicorn
- sqlalchemy
- pymysql
- python-dotenv
- openai
- chromadb
- groq
- werkzeug (for password hashing)
- python-multipart (for file uploads)

## Step 4: Run Database Migrations

The application will automatically create tables when you start it. Alternatively, you can run:

```bash
python -c "from src.db.database import engine, Base; from src.db import models; Base.metadata.create_all(bind=engine)"
```

## Step 5: Create Admin User

You can create an admin user through:
1. The frontend registration form (set user_type to "admin")
2. Or directly in phpMyAdmin:

```sql
INSERT INTO users (name, email, password, user_type) 
VALUES ('Admin', 'admin@empowerwork.com', '$2b$12$hashed_password_here', 'admin');
```

**Note**: Password should be hashed using werkzeug's `generate_password_hash()`. For testing, you can use the registration form.

## Step 6: Start Backend Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## Step 7: Start Frontend

```bash
cd frontend-react
npm install
npm run dev
```

## Database Schema

The application will create these tables automatically:

- `users` - User accounts with photos and admin flags
- `disabilities` - Disability types
- `skills` - Skill types
- `companies` - Company information
- `locations` - Location data
- `jobs` - Job listings
- `job_requirements` - Job requirements
- `job_disability_support` - Many-to-many relationship
- `embeddings` - Vector embeddings for RAG
- `job_applications` - Job applications
- `conversation_logs` - Chat logs
- `activity_log` - Activity tracking

## File Uploads

Profile photos are stored in `uploads/profiles/` directory. Make sure this directory exists and is writable.

## Admin Features

Admins can:
- View all users with photos
- Edit/delete users
- Manage jobs (add, edit, delete)
- Manage companies
- View statistics dashboard
- Control all aspects of the system

## Troubleshooting

### Connection Error
- Check MySQL is running in XAMPP Control Panel
- Verify database name matches `.env` file
- Check username/password in `.env`

### Photo Upload Issues
- Ensure `uploads/profiles/` directory exists
- Check file permissions
- Verify file size is under 5MB

### Admin Access
- Make sure user has `user_type = 'admin'` in database
- Check AuthContext is reading user_type correctly

## Default Admin Account

After first setup, create an admin account:
1. Register normally through frontend
2. Update user_type in database:
   ```sql
   UPDATE users SET user_type = 'admin' WHERE email = 'your@email.com';
   ```

