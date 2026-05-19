# API Client

## 📁 Files

### `api.js`
Centralized API client using Axios:
- Base URL configuration
- Request/response interceptors
- Error handling
- Token management
- All API endpoints

## 🔧 API Endpoints

### Authentication
- `authAPI.register()` - User registration
- `authAPI.login()` - User login
- `authAPI.logout()` - Logout
- `authAPI.getCurrentUser()` - Get current user

### Users
- `userAPI.getProfile()` - Get user profile
- `userAPI.updateProfile()` - Update profile
- `userAPI.getAllUsers()` - List all users
- `userAPI.deleteUser()` - Delete user

### Jobs
- `jobAPI.addJob()` - Create job
- `jobAPI.searchJobs()` - Search jobs
- `jobAPI.getJob()` - Get job details
- `jobAPI.updateJob()` - Update job
- `jobAPI.deleteJob()` - Delete job
- `jobAPI.getAllJobs()` - List all jobs

### Applications
- `applicationAPI.applyForJob()` - Submit application
- `applicationAPI.getUserApplications()` - User applications
- `applicationAPI.getPendingApplications()` - Pending apps
- `applicationAPI.reviewApplication()` - Review application

### Chat
- `chatAPI.sendMessage()` - Send chat message

### Disabilities
- `disabilityAPI.getAllDisabilities()` - List disabilities
- `disabilityAPI.addDisability()` - Add disability
- `disabilityAPI.updateDisability()` - Update disability
- `disabilityAPI.deleteDisability()` - Delete disability

### Tools
- `toolsAPI.getAllTools()` - List tools
- `toolsAPI.getToolsForUser()` - User recommendations
- `toolsAPI.addTool()` - Add tool
- `toolsAPI.updateTool()` - Update tool
- `toolsAPI.deleteTool()` - Delete tool

## 🔐 Authentication

All authenticated requests include:
- Bearer token in Authorization header
- Automatic token refresh
- Error handling for 401 responses

## 📝 Error Handling

Centralized error handling:
- Network errors
- API errors
- Authentication errors
- Toast notifications

