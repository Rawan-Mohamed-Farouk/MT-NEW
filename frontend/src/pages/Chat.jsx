import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Chat with Job Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get personalized job recommendations based on your profile
          </p>
        </div>

        <div className="h-[600px]">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default Chat;

