import { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { applicationAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ApplicationModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Method selection, 2: CV upload/manual, 3: Review, 4: Success
  const [method, setMethod] = useState(''); // 'upload' or 'manual'
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // Manual entry fields
  const [manualData, setManualData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    education: '',
  });

  // Initialize manual data with user info when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setManualData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        skills: '',
        experience: '',
        education: '',
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setCvFile(file);
      setCvPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to apply');
      return;
    }

    if (method === 'upload' && !cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    if (method === 'manual' && !manualData.name && !manualData.email) {
      toast.error('Please fill in at least name and email');
      return;
    }

    setLoading(true);
    setProgress(25);

    try {
      if (method === 'upload') {
        // Upload CV and extract info
        setProgress(50);
        const response = await applicationAPI.applyForJob(
          job.id,
          user.id,
          coverLetter,
          cvFile
        );
        
        setProgress(75);
        setExtractedInfo(response.data.extracted_info);
        setStep(3); // Show review step
      } else {
        // Manual entry - create extracted info from form data
        setProgress(50);
        const manualInfo = {
          name: manualData.name || user.name,
          email: manualData.email || user.email,
          phone: manualData.phone || user.phone || '',
          skills: manualData.skills ? manualData.skills.split(',').map(s => s.trim()) : [],
          experience_years: manualData.experience || '',
          education: manualData.education ? [manualData.education] : [],
          extraction_success: true,
          manual_entry: true
        };
        
        // Submit application with manual data (no CV file)
        setProgress(75);
        const response = await applicationAPI.applyForJobManual(
          job.id,
          user.id,
          coverLetter,
          manualInfo
        );
        
        setExtractedInfo(manualInfo);
        setStep(3); // Show review step
      }
      setProgress(100);
    } catch (error) {
      handleAPIError(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Application already submitted in handleSubmit, just show success
    setStep(4); // Success step
    toast.success('Application submitted! Waiting for admin approval.');
    setTimeout(() => {
      onSuccess();
      onClose();
      // Reset form
      setStep(1);
      setMethod('');
      setCoverLetter('');
      setCvFile(null);
      setCvPreview(null);
      setExtractedInfo(null);
      setProgress(0);
      setManualData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        skills: '',
        experience: '',
        education: '',
      });
    }, 2000);
  };

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Focus first focusable element
    const firstFocusable = document.querySelector('[role="dialog"] button, [role="dialog"] input, [role="dialog"] textarea');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
            Apply for {job.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent rounded"
            aria-label="Close application modal"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <p id="modal-description" className="sr-only">
          Application form for {job.title} position
        </p>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step 1: Method Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                How would you like to apply? Please choose a method:
              </p>
              
              <button
                onClick={() => handleMethodSelect('upload')}
                className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Upload CV PDF file"
              >
                <div className="flex items-center space-x-4">
                  <Upload className="h-8 w-8 text-accent" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Upload CV (PDF)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload your CV and we'll extract your information automatically
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('manual')}
                className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Enter information manually"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-accent" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Manual Entry
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enter your information manually
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: CV Upload or Manual Entry */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>

              {method === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Your CV (PDF) *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-accent transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent/80">
                          <span>Upload a PDF file</span>
                          <input
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 5MB</p>
                      {cvFile && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          ✓ {cvFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Enter Your Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={manualData.name}
                      onChange={(e) => setManualData({...manualData, name: e.target.value})}
                      className="input-field"
                      placeholder={user.name || "Your full name"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={manualData.email}
                      onChange={(e) => setManualData({...manualData, email: e.target.value})}
                      className="input-field"
                      placeholder={user.email || "your.email@example.com"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={manualData.phone}
                      onChange={(e) => setManualData({...manualData, phone: e.target.value})}
                      className="input-field"
                      placeholder={user.phone || "Your phone number"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={manualData.skills}
                      onChange={(e) => setManualData({...manualData, skills: e.target.value})}
                      className="input-field"
                      placeholder="Python, JavaScript, React, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={manualData.experience}
                      onChange={(e) => setManualData({...manualData, experience: e.target.value})}
                      className="input-field"
                      placeholder="e.g., 5 years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education
                    </label>
                    <textarea
                      value={manualData.education}
                      onChange={(e) => setManualData({...manualData, education: e.target.value})}
                      className="input-field"
                      rows={2}
                      placeholder="Bachelor's in Computer Science, etc."
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={(method === 'upload' && !cvFile) || (method === 'manual' && !manualData.name && !manualData.email) || loading}
                  className="btn-primary"
                >
                  {loading ? 'Processing...' : method === 'upload' ? 'Upload & Extract' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Extracted Info */}
          {step === 3 && extractedInfo && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    CV information extracted successfully!
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Extracted Information:
                </h3>
                
                {extractedInfo.name && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                    <p className="font-medium">{extractedInfo.name}</p>
                  </div>
                )}
                
                {extractedInfo.email && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                    <p className="font-medium">{extractedInfo.email}</p>
                  </div>
                )}
                
                {extractedInfo.phone && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                    <p className="font-medium">{extractedInfo.phone}</p>
                  </div>
                )}
                
                {extractedInfo.skills && extractedInfo.skills.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {extractedInfo.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {extractedInfo.experience_years && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Experience:</span>
                    <p className="font-medium">{extractedInfo.experience_years} years</p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      Application Status: Pending
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your application will be reviewed by an admin. You'll be notified once it's reviewed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your application has been submitted and is waiting for admin approval.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can track your application status in your profile.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;

