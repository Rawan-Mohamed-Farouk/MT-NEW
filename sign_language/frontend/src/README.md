# Frontend Source Code

## 📁 Directory Structure

### `components/`
Reusable React components:
- **AccessibilityControls**: Accessibility settings panel
- **ApplicationModal**: Job application modal with CV upload
- **ChatBox**: Chat interface component
- **Footer**: Footer component
- **JobCard**: Job listing card display
- **JobForm**: Job creation/editing form
- **Navbar**: Navigation bar with user menu
- **Table**: Reusable data table
- **UserForm**: User profile form

### `pages/`
Page components (routes):
- **Home**: Job search and listing page
- **Profile**: User profile and applications
- **Chat**: Chatbot page
- **Tools**: Assistive tools page
- **Login**: Login page
- **Register**: Registration page
- **AdminDashboard**: Admin overview
- **AdminUsers**: User management
- **AdminJobs**: Job management
- **AdminCompanies**: Company management
- **AdminApplications**: Application review
- **AdminDisabilities**: Disability management

### `api/`
API client:
- **api.js**: Axios configuration and API endpoints

### `context/`
React context providers:
- **AuthContext**: Authentication state management

### `utils/`
Utility functions:
- **accessibility.js**: Accessibility helper functions

### `App.jsx`
Main application component with routing.

### `main.jsx`
Application entry point.

### `index.css`
Global styles and TailwindCSS configuration.

## 🎨 Styling

- **TailwindCSS** - Utility-first CSS
- **Dark Mode** - Automatic dark mode support
- **Responsive** - Mobile-first design
- **Accessible** - WCAG AA compliant

## 🔄 State Management

- **React Context** - Authentication state
- **Local State** - Component-level state
- **LocalStorage** - Persistent user data

## 📡 API Integration

All API calls go through `api/api.js`:
- Centralized error handling
- Token management
- Request/response interceptors

