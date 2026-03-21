# EmpowerWork Frontend - React Application

Complete React frontend for the Job Assistance System for People with Disabilities.

## 🚀 Features

- **User Authentication** - Register, login, and profile management
- **Job Search** - Search and filter jobs by skills, disabilities, location, and type
- **RAG Chatbot** - AI-powered job recommendations via chat interface
- **Admin Dashboard** - Complete CRUD operations for users, jobs, and companies
- **Responsive Design** - Mobile-friendly with dark/light mode
- **Real-time Updates** - Toast notifications and loading states

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- FastAPI backend running on `http://localhost:8000`

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your API URL:
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
frontend-react/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── JobCard.jsx
│   │   ├── ChatBox.jsx
│   │   ├── UserForm.jsx
│   │   ├── JobForm.jsx
│   │   └── Table.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── Chat.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── AdminJobs.jsx
│   │   └── AdminCompanies.jsx
│   ├── api/             # API configuration
│   │   └── api.js
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Features Breakdown

### User Features
- **Registration/Login** - Secure authentication
- **Profile Management** - Edit personal info, disabilities, and skills
- **Job Search** - Advanced filtering and search
- **Chat Assistant** - RAG-powered job recommendations

### Admin Features
- **Dashboard** - Overview statistics
- **User Management** - CRUD operations for users
- **Job Management** - Add, edit, delete jobs
- **Company Management** - Manage company information

## 🔌 API Integration

The frontend connects to these FastAPI endpoints:

- `POST /users/add_user` - Register user
- `POST /auth/login` - Login (if implemented)
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile
- `POST /jobs/add_job` - Add job
- `POST /jobs/search_jobs` - Search jobs
- `GET /jobs` - Get all jobs
- `POST /chat/` - Chat with RAG bot
- `GET /companies` - Get companies
- `GET /disabilities` - Get disabilities
- `GET /skills` - Get skills

## 🎨 Styling

- **TailwindCSS** - Utility-first CSS framework
- **Dark Mode** - Toggle via navbar button
- **Responsive** - Mobile-first design
- **Custom Colors** - Brand colors (accent: #21978C, secondary: #F68E3C)

## 📱 Responsive Design

- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: 3-column grid for job listings

## 🔐 Authentication

- JWT tokens stored in localStorage
- Protected routes with `PrivateRoute` component
- Admin routes with `AdminRoute` component
- Auto-redirect on 401 errors

**Note**: The backend currently doesn't have a `/auth/login` endpoint. You may need to:
1. Implement authentication in the backend, OR
2. Modify the login flow to work with your existing auth system, OR
3. Use the registration endpoint and store user data locally for testing

For testing, you can modify `src/api/api.js` to handle login differently based on your backend implementation.

## 🚀 Build for Production

```bash
npm run build
# or
yarn build
```

Output will be in the `dist/` folder.

## 🧪 Testing

The app includes:
- Error handling with toast notifications
- Loading states for async operations
- Form validation
- Responsive design testing

## 📝 Notes

- Ensure backend API is running before starting frontend
- Update API endpoints in `src/api/api.js` if backend URLs differ
- Admin routes require `user_type: 'admin'` or `role: 'admin'` in user object

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Part of the EmpowerWork project.

