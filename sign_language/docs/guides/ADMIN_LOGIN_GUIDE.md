# How to Sign In as Admin

## 📋 Quick Guide

### Option 1: Create Admin User via Script (Easiest)

1. **Run the admin creation script**:
   ```bash
   python create_admin_user.py
   ```

2. **Follow the prompts**:
   - Enter admin name (or press Enter for "Admin")
   - Enter admin email (required)
   - Enter password (min 8 characters)

3. **Login**:
   - Go to: http://localhost:3000/login
   - Select "Admin Login" from dropdown
   - Enter email and password
   - Click "Sign In"
   - You'll be redirected to `/admin` dashboard

### Option 2: Create Admin via Registration + Database Update

1. **Register normally**:
   - Go to: http://localhost:3000/register
   - Fill in the registration form
   - Create account

2. **Update user type in database**:
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Select database: `rag_jobs`
   - Go to `users` table
   - Find your user
   - Edit `user_type` field: Change from `user` to `admin`
   - Save

3. **Login**:
   - Go to: http://localhost:3000/login
   - Select "Admin Login"
   - Use your email and password

### Option 3: Create Admin via API (Advanced)

You can also create an admin user directly via the API:

```bash
# Using curl or Postman
POST http://localhost:8000/users/add_user
Content-Type: multipart/form-data

name=Admin
email=admin@example.com
password=yourpassword123
user_type=admin
```

## 🔐 Login Steps

1. **Go to Login Page**: http://localhost:3000/login

2. **Select Login Type**: 
   - Choose "Admin Login" from the dropdown

3. **Enter Credentials**:
   - Email: Your admin email
   - Password: Your admin password

4. **Click "Sign In"**

5. **Automatic Redirect**:
   - If admin → Redirects to `/admin` dashboard
   - If regular user → Redirects to `/` home page

## ✅ Verify Admin Status

After login, you should:
- See "Admin Dashboard" link in navbar
- Be redirected to `/admin` automatically
- Have access to:
  - `/admin` - Dashboard
  - `/admin/users` - Manage users
  - `/admin/jobs` - Manage jobs
  - `/admin/companies` - Manage companies
  - `/admin/applications` - Review applications

## 🛠️ Troubleshooting

### "Invalid email or password"
- Check email is correct
- Check password is correct
- Verify user exists in database

### "Not redirected to admin dashboard"
- Check `user_type` field in database = `'admin'`
- Check localStorage has user data with `user_type: 'admin'`
- Try logging out and logging in again

### "Can't access admin pages"
- Verify `user_type = 'admin'` in database
- Check browser console for errors
- Clear browser cache and try again

## 📝 Default Admin Account

If you want to create a default admin account, run:

```bash
python create_admin_user.py
```

Then use:
- **Email**: admin@empowerwork.com (or your choice)
- **Password**: admin123456 (or your choice)

## 🔒 Security Note

- Admin passwords are hashed (never stored in plain text)
- Use strong passwords (8+ characters)
- Change default passwords in production
- Admin accounts have full system access

## 🎯 Admin Features

Once logged in as admin, you can:
- ✅ View all users
- ✅ Add/Edit/Delete users
- ✅ Add/Edit/Delete jobs
- ✅ Manage companies
- ✅ Review and approve/reject applications
- ✅ View statistics dashboard

