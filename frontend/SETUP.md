# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd frontend-react
npm install
```

## Step 2: Configure Environment

Create a `.env` file in the `frontend-react` directory:

```env
VITE_API_URL=http://localhost:8000
```

## Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 4: Verify Backend Connection

Make sure your FastAPI backend is running on `http://localhost:8000` before using the frontend.

## Troubleshooting

### Port Already in Use
If port 3000 is busy, Vite will automatically use the next available port (3001, 3002, etc.)

### API Connection Errors
- Verify backend is running: `curl http://localhost:8000/docs`
- Check `.env` file has correct `VITE_API_URL`
- Check browser console for CORS errors

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Default Routes

- `/` - Home/Job Search
- `/login` - User Login
- `/register` - User Registration
- `/profile` - User Profile (requires login)
- `/chat` - RAG Chatbot (requires login)
- `/admin` - Admin Dashboard (requires admin)
- `/admin/users` - Manage Users (requires admin)
- `/admin/jobs` - Manage Jobs (requires admin)
- `/admin/companies` - Manage Companies (requires admin)

