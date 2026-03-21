import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, LogOut, User, Briefcase, MessageSquare, Home, Wrench, Shield, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || false
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2" aria-label="EmpowerWork Home">
              <img 
                src="/empowerwork-logo.png" 
                alt="EmpowerWork" 
                className="h-10 w-auto"
              />
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Home page"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="User profile"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Chat with job assistant"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>Chat</span>
                </Link>
                <Link
                  to="/tools"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Assistive tools and resources"
                >
                  <Wrench className="h-4 w-4" aria-hidden="true" />
                  <span>Tools</span>
                </Link>
                <Link
                  to="/ai-tools"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="AI tools for jobs and communication"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>AI Tools</span>
                </Link>
                {isAdmin() && (
                  <>
                    <Link
                      to="/admin"
                      className="px-3 py-2 rounded-md text-sm font-medium text-accent hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/security"
                      className="px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
                    >
                      <Shield className="h-4 w-4" />
                      Security
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.photo ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.photo}`}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border-2 border-accent"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Logout from account"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

