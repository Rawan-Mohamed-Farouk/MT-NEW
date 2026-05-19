import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { applicationAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react';

const AdminApplications = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchApplications();
  }, [user, isAdmin, navigate]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationAPI.getPendingApplications();
      setApplications(response.data.applications || []);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (application) => {
    setSelectedApp(application);
    setReviewStatus('approved');
    setAdminNotes('');
    setShowReviewModal(true);
  };

  const handleApproveReject = async () => {
    if (!selectedApp) return;
    
    try {
      await applicationAPI.reviewApplication(
        selectedApp.id,
        reviewStatus,
        adminNotes,
        user.id
      );
      toast.success(`Application ${reviewStatus} successfully`);
      setShowReviewModal(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (error) {
      handleAPIError(error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      reviewing: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Review Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Approve or reject job applications
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No pending applications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {app.job_title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Applicant:</strong> {app.user_name} ({app.user_email})
                    </p>
                    {app.cover_letter && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                        <strong>Cover Letter:</strong> {app.cover_letter}
                      </p>
                    )}
                    {app.cv_extracted_info && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <strong>Extracted Info:</strong>
                        {app.cv_extracted_info.name && <p>Name: {app.cv_extracted_info.name}</p>}
                        {app.cv_extracted_info.email && <p>Email: {app.cv_extracted_info.email}</p>}
                        {app.cv_extracted_info.phone && <p>Phone: {app.cv_extracted_info.phone}</p>}
                        {app.cv_extracted_info.skills && app.cv_extracted_info.skills.length > 0 && (
                          <p>Skills: {app.cv_extracted_info.skills.join(', ')}</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Applied: {new Date(app.applied_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {app.cv_file_path && (
                      <a
                        href={`http://localhost:8000${app.cv_file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View CV</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleReview(app)}
                      className="btn-primary"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Review Application
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <strong>Job:</strong> {selectedApp.job_title}
                  </div>
                  <div>
                    <strong>Applicant:</strong> {selectedApp.user_name} ({selectedApp.user_email})
                  </div>
                  {selectedApp.cover_letter && (
                    <div>
                      <strong>Cover Letter:</strong>
                      <p className="mt-1 text-gray-700 dark:text-gray-300">{selectedApp.cover_letter}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Decision *
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="reviewing">Mark as Reviewing</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Add notes or feedback..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedApp(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveReject}
                    className={`btn-primary ${
                      reviewStatus === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : reviewStatus === 'rejected'
                        ? 'bg-red-600 hover:bg-red-700'
                        : ''
                    }`}
                  >
                    {reviewStatus === 'approved' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                    {reviewStatus === 'rejected' && <XCircle className="h-4 w-4 inline mr-1" />}
                    {reviewStatus === 'reviewing' && <Clock className="h-4 w-4 inline mr-1" />}
                    {reviewStatus === 'approved' ? 'Approve' : reviewStatus === 'rejected' ? 'Reject' : 'Mark as Reviewing'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplications;

