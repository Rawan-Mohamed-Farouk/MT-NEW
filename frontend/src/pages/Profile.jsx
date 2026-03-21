import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { userAPI, applicationAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [showApplications, setShowApplications] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchApplications();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await userAPI.getProfile(user.id);
      setProfile(response.data);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user?.id) return;
    setApplicationsLoading(true);
    try {
      const response = await applicationAPI.getUserApplications(user.id);
      setApplications(response.data.applications || []);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleSubmit = async (formData, photoFile) => {
    if (!user?.id) return;
    try {
      const response = await userAPI.updateProfile(user.id, formData, photoFile);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setProfile(response.data);
      }
      fetchProfile();
    } catch (error) {
      throw error;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reviewing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'reviewing':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile information, disabilities, and skills
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <UserForm user={profile || user} onSubmit={handleSubmit} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  My Applications
                </h2>
                <button
                  onClick={() => setShowApplications(!showApplications)}
                  className="text-sm text-accent hover:underline"
                >
                  {showApplications ? 'Hide' : 'Show'}
                </button>
              </div>

              {showApplications && (
                <div className="space-y-4">
                  {applicationsLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No applications yet. Apply for jobs to see them here.
                    </p>
                  ) : (
                    applications.map((app) => (
                      <div
                        key={app.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {app.job_title || 'Job Application'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Applied: {new Date(app.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="text-xs font-medium capitalize">{app.status}</span>
                          </div>
                        </div>
                        
                        {app.admin_notes && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300">
                            <strong>Admin Note:</strong> {app.admin_notes}
                          </div>
                        )}
                        
                        {app.reviewed_at && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

