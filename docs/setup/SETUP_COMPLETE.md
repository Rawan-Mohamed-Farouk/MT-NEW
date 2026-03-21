# ✅ Setup Complete - EmpowerWork with XAMPP MySQL

## What's Been Implemented

### ✅ Database Integration
- **User Model Updated**: Added `photo`, `password`, `user_type` (admin/user), `phone`, `age`, `gender` fields
- **XAMPP MySQL Connection**: Configured to use XAMPP's MySQL/MariaDB
- **File Upload Support**: Profile photos stored in `uploads/profiles/`

### ✅ Backend Features
- **User Registration**: With photo upload support
- **User Login**: Password authentication with werkzeug hashing
- **User Profile**: Full CRUD with photo management
- **Admin Controls**: Complete admin dashboard
- **Photo Serving**: Static file serving for profile photos

### ✅ Frontend Features
- **Profile Photos**: Upload and display user photos
- **User Profile Page**: Complete profile management with photo
- **Admin Dashboard**: Full control over users, jobs, companies
- **Photo Display**: Photos shown in navbar and profile pages
- **Admin User Management**: Create/edit/delete users with photos

## Quick Start

### 1. Database Setup
```bash
# Create database in phpMyAdmin: rag_jobs
# Or use MySQL command line:
mysql -u root -p
CREATE DATABASE rag_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Environment Configuration
Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=rag_jobs
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_groq_key_here
```

### 3. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create Upload Directory
```bash
mkdir -p uploads/profiles
```

### 5. Start Backend
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Start Frontend
```bash
cd frontend-react
npm install
npm run dev
```

## Admin Features

Admins can control:
- ✅ **Users**: View all users with photos, edit, delete, create new users
- ✅ **Jobs**: Full CRUD operations on job listings
- ✅ **Companies**: Manage company information
- ✅ **Dashboard**: View statistics and analytics
- ✅ **Profile Photos**: Upload and manage user photos

## User Profile Features

Users can:
- ✅ Upload profile photo
- ✅ Edit personal information (name, email, age, gender, phone)
- ✅ Manage disabilities and skills
- ✅ Update password
- ✅ View their profile with photo

## API Endpoints

### User Management
- `POST /users/add_user` - Register with photo upload
- `POST /users/login` - Login with email/password
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update profile with photo
- `GET /users` - Get all users (admin)
- `DELETE /users/{id}` - Delete user (admin)

### Photo Access
- `GET /uploads/profiles/{filename}` - Serve profile photos

## Database Schema

Key tables:
- `users` - User accounts with photos and admin flags
- `jobs` - Job listings from your database
- `companies` - Company information
- `disabilities` - Disability types
- `skills` - Skill types

## Notes

1. **Photo Storage**: Photos are stored in `uploads/profiles/` directory
2. **Admin Access**: Set `user_type = 'admin'` in database for admin access
3. **Password Hashing**: Uses werkzeug's secure password hashing
4. **File Size Limit**: Profile photos limited to 5MB
5. **Supported Formats**: All image formats (jpg, png, gif, etc.)

## Testing

1. Register a new user with photo
2. Login with credentials
3. Update profile and change photo
4. Create admin user: Update `user_type` to 'admin' in database
5. Access admin dashboard
6. Manage users, jobs, and companies

## Troubleshooting

- **Database Connection**: Check XAMPP MySQL is running
- **Photo Upload**: Ensure `uploads/profiles/` directory exists and is writable
- **Admin Access**: Verify `user_type = 'admin'` in database
- **CORS Issues**: Backend should allow requests from frontend origin

Everything is ready! Your database is integrated, profile photos work, and admins have full control! 🎉

