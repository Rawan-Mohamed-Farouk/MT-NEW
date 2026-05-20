# Job Application System with CV Upload & Admin Approval

## ✅ Features Implemented

### 1. **Application Flow**
- User clicks "Apply" on a job
- Modal opens asking for application method
- User selects "Upload CV (PDF)"
- User uploads CV and optional cover letter
- System extracts information from CV automatically
- Application submitted with status "pending"
- Admin reviews and approves/rejects

### 2. **CV PDF Extraction**
- Extracts: Name, Email, Phone, Skills, Experience, Education
- Uses PyPDF2 library for PDF parsing
- Stores extracted info in database as JSON
- Shows extracted info to user for confirmation

### 3. **Application Status Queue**
- **Pending**: Waiting for admin review (default)
- **Reviewing**: Admin is reviewing
- **Approved**: Application approved
- **Rejected**: Application rejected

### 4. **Admin Review System**
- Admin can view all pending applications (queue)
- Admin can view applications by job
- Admin can approve/reject with notes
- Tracks who reviewed and when

## 📁 Files Created/Modified

### Backend:
- `src/db/models.py` - Updated JobApplication model
- `src/routes/applications.py` - Application routes
- `src/utils/pdf_extractor.py` - PDF extraction utility
- `src/main.py` - Added applications router
- `requirements.txt` - Added PyPDF2

### Frontend:
- `frontend-react/src/components/ApplicationModal.jsx` - Application modal
- `frontend-react/src/pages/Home.jsx` - Integrated application modal
- `frontend-react/src/api/api.js` - Added application API endpoints

## 🔄 Application Flow

### User Side:
1. User clicks "Apply" button
2. Modal opens → Step 1: Choose method
3. Selects "Upload CV" → Step 2: Upload CV + cover letter
4. System extracts info → Step 3: Review extracted info
5. Confirm → Step 4: Success message
6. Application status: **Pending** (waiting for admin)

### Admin Side:
1. Admin views pending applications queue
2. Admin opens application
3. Admin sees: CV, extracted info, cover letter
4. Admin approves/rejects with notes
5. Status changes: **Approved** or **Rejected**

## 📊 Database Schema

### JobApplication Table:
```sql
- id: Primary key
- job_id: Foreign key to jobs
- user_id: Foreign key to users
- cover_letter: Text (optional)
- cv_file_path: String (path to PDF)
- cv_extracted_info: JSON (extracted data)
- status: String (pending, approved, rejected, reviewing)
- admin_notes: Text (admin comments)
- reviewed_at: DateTime (when reviewed)
- reviewed_by: Foreign key to users (admin)
- applied_at: DateTime (when applied)
```

## 🎯 API Endpoints

### POST `/applications/apply`
- Apply for a job with CV upload
- Requires: job_id, user_id, cv (PDF file), cover_letter (optional)
- Returns: application_id, status, extracted_info

### GET `/applications/user/{user_id}`
- Get all applications for a user
- Returns: List of applications with status

### GET `/applications/job/{job_id}`
- Get all applications for a job (admin)
- Optional: ?status=pending
- Returns: List of applications

### GET `/applications/pending`
- Get all pending applications (admin queue)
- Returns: List of pending applications ordered by applied_at

### PUT `/applications/{application_id}/review`
- Admin reviews application
- Requires: status, reviewer_id, admin_notes (optional)
- Updates: status, reviewed_at, reviewed_by

### GET `/applications/{application_id}`
- Get single application details
- Returns: Full application info

## 🧪 Testing

### Test Application Flow:
1. Login as user
2. Search for a job
3. Click "Apply"
4. Select "Upload CV"
5. Upload a PDF CV
6. Review extracted information
7. Confirm application
8. Check status: Should be "pending"

### Test Admin Review:
1. Login as admin
2. Go to admin dashboard
3. View pending applications
4. Review application
5. Approve/Reject with notes
6. Check status updated

## 📝 Next Steps (Optional)

1. **User Application Tracking Page**
   - Show user's applications
   - Display status and progress
   - Show admin notes if reviewed

2. **Admin Application Dashboard**
   - Queue view with filters
   - Bulk actions
   - Statistics

3. **Email Notifications**
   - Notify user when application reviewed
   - Notify admin when new application

4. **CV Download**
   - Admin can download CVs
   - User can view their uploaded CV

The application system is now fully functional! 🎉

