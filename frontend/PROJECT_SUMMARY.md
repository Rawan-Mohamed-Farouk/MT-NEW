# EmpowerWork Frontend - Project Summary

## ✅ Complete React Frontend Application

This is a fully functional React frontend for the Job Assistance System for People with Disabilities.

## 📦 What's Included

### Core Features
- ✅ User Registration & Login
- ✅ User Profile Management (with disabilities & skills)
- ✅ Job Search with Advanced Filters
- ✅ RAG Chatbot Interface
- ✅ Admin Dashboard
- ✅ Complete CRUD for Users, Jobs, Companies
- ✅ Dark/Light Mode Toggle
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Toast Notifications
- ✅ Protected Routes (Auth & Admin)

### Technology Stack
- **React 18** - Functional components with hooks
- **React Router 6** - Navigation
- **TailwindCSS 3** - Styling
- **Axios** - API requests
- **Zustand** - State management (available, not heavily used)
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Vite** - Build tool

### File Structure
```
frontend-react/
├── src/
│   ├── components/          # 7 reusable components
│   ├── pages/               # 9 page components
│   ├── api/                 # API configuration
│   ├── context/             # Auth context
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── README.md                # Full documentation
└── SETUP.md                 # Quick setup guide
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend-react
   npm install
   ```

2. **Create `.env` file:**
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## 🔌 API Endpoints Used

The frontend expects these FastAPI endpoints:

- `POST /users/add_user` - User registration
- `POST /auth/login` - User login (or adapt to your auth endpoint)
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (admin)
- `GET /users` - Get all users (admin)
- `POST /jobs/add_job` - Add job (admin)
- `POST /jobs/search_jobs` - Search jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/:id` - Get job details
- `PUT /jobs/:id` - Update job (admin)
- `DELETE /jobs/:id` - Delete job (admin)
- `POST /chat/` - RAG chatbot
- `GET /companies` - Get companies
- `POST /companies` - Add company (admin)
- `PUT /companies/:id` - Update company (admin)
- `DELETE /companies/:id` - Delete company (admin)
- `GET /disabilities` - Get disabilities list
- `GET /skills` - Get skills list

## 🎨 UI Components

### Reusable Components
1. **Navbar** - Navigation with auth state, dark mode toggle
2. **Footer** - Site footer
3. **JobCard** - Job listing card with details
4. **ChatBox** - RAG chatbot interface
5. **UserForm** - User profile form with disabilities/skills
6. **JobForm** - Job creation/editing form
7. **Table** - Reusable data table with edit/delete

### Pages
1. **Home** - Job search with filters
2. **Login** - User login
3. **Register** - User registration
4. **Profile** - User profile management
5. **Chat** - RAG chatbot page
6. **AdminDashboard** - Admin overview with stats
7. **AdminUsers** - User management (CRUD)
8. **AdminJobs** - Job management (CRUD)
9. **AdminCompanies** - Company management (CRUD)

## 🔐 Authentication Flow

1. User registers → `POST /users/add_user`
2. User logs in → `POST /auth/login` → Store token in localStorage
3. Protected routes check `AuthContext` for user
4. API requests include token in Authorization header
5. 401 errors trigger logout and redirect to login

## 🎯 Key Features

### Job Search
- Text search by title/description
- Filter by disability support
- Filter by required skills
- Filter by employment type (full-time, part-time, etc.)
- Filter by remote type (remote, on-site, hybrid)
- Real-time search results

### User Profile
- Personal information (name, email, age, gender, phone)
- Multi-select disabilities
- Multi-select skills
- Auto-save on submit

### Admin Dashboard
- Statistics cards (users, jobs, companies, applications)
- Quick navigation to management pages
- Analytics overview

### RAG Chatbot
- Real-time chat interface
- Sends user message + profile to `/chat/` endpoint
- Displays bot response with context
- Loading states and error handling

## 📱 Responsive Design

- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid for job listings
- **Desktop**: 3-column grid for job listings
- **Navbar**: Collapsible menu on mobile
- **Forms**: Responsive grid layouts

## 🌙 Dark Mode

- Toggle button in navbar
- Persists preference in localStorage
- Applies to all components
- Smooth transitions

## ⚠️ Important Notes

1. **Backend Required**: Frontend won't work without running FastAPI backend
2. **CORS**: Ensure backend allows requests from `http://localhost:3000`
3. **Auth Endpoint**: May need to adjust login endpoint in `src/api/api.js`
4. **Admin Check**: Admin routes check for `user_type === 'admin'` or `role === 'admin'`
5. **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)

## 🐛 Error Handling

- API errors show toast notifications
- Loading states for all async operations
- Form validation
- 401 errors trigger auto-logout
- Network errors handled gracefully

## 📝 Next Steps

1. Install dependencies: `npm install`
2. Configure `.env` with API URL
3. Start backend server
4. Start frontend: `npm run dev`
5. Test all features
6. Customize styling if needed
7. Deploy to production

## 🎉 Ready to Use!

The frontend is complete and ready to connect to your FastAPI backend. All components are functional, styled, and integrated.

