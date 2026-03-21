"""
Script to create an admin user
Usage: python create_admin_user.py <email> <password> [name]
Example: python create_admin_user.py admin@test.com admin123 Admin
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import sys
import os
# Add project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from backend.src.db.database import get_db
from backend.src.db import models
from werkzeug.security import generate_password_hash

def create_admin(email, password, name="Admin"):
    """Create an admin user"""
    db = next(get_db())
    
    print("=" * 50)
    print("Create Admin User")
    print("=" * 50)
    
    if not email:
        print("ERROR: Email is required!")
        print("Usage: python create_admin_user.py <email> <password> [name]")
        return
    
    if not password or len(password) < 8:
        print("ERROR: Password must be at least 8 characters!")
        return
    
    # Check if user already exists
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        print(f"\nUser with email '{email}' already exists!")
        print("Updating to admin...")
        existing.user_type = 'admin'
        existing.password = generate_password_hash(password)
        db.commit()
        print(f"\nSUCCESS: User '{email}' is now an admin!")
    else:
        # Create admin user
        admin_user = models.User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            user_type='admin'
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("\nSUCCESS: Admin user created!")
    
    print("=" * 50)
    print("Login Credentials:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print("\nLogin at: http://localhost:3000/login")
    print("Select 'Admin Login' from dropdown")
    print("=" * 50)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin_user.py <email> <password> [name]")
        print("Example: python create_admin_user.py admin@test.com admin123456 Admin")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else "Admin"
    
    try:
        create_admin(email, password, name)
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
