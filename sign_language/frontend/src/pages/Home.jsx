import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Briefcase, Users, MessageSquare, Wrench, CheckCircle, ArrowRight, Sparkles, Heart, Shield } from 'lucide-react';
import JobCard from '../components/JobCard';
import ApplicationModal from '../components/ApplicationModal';
import { jobAPI, disabilityAPI, skillAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    disability_id: '',
    skill_id: '',
    employment_type: '',
    remote_type: '',
  });
  const [disabilities, setDisabilities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    // Only fetch data if user is logged in
    if (user) {
      fetchDisabilities();
      fetchSkills();
      // Load all jobs on mount (when all filters are "All")
      searchJobs();
    }
  }, [user]);

  const fetchDisabilities = async () => {
    try {
      const response = await disabilityAPI.getAllDisabilities();
      setDisabilities(response.data || []);
    } catch (error) {
      console.error('Error fetching disabilities:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await skillAPI.getAllSkills();
      setSkills(response.data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const searchJobs = async () => {
    setLoading(true);
    try {
      // Build params - send empty strings for "All" options, undefined will be treated as "All"
      const params = {
        query: searchQuery?.trim() || undefined,
        // Only send filter if it's not empty/"All"
        disability_id: filters.disability_id && filters.disability_id !== '' ? filters.disability_id : undefined,
        skill_id: filters.skill_id && filters.skill_id !== '' ? filters.skill_id : undefined,
        employment_type: filters.employment_type && filters.employment_type !== '' ? filters.employment_type : undefined,
        remote_type: filters.remote_type && filters.remote_type !== '' ? filters.remote_type : undefined,
      };
      const response = await jobAPI.searchJobs(params);
      // Backend returns {results: [...]}
      setJobs(response.data?.results || response.data?.jobs || response.data || []);
    } catch (error) {
      handleAPIError(error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Always search - if no query/filters, backend will return all jobs
    searchJobs();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Auto-search when filter changes (if there's a query or any filter)
      const hasQuery = searchQuery && searchQuery.trim().length > 0;
      const hasAnyFilter = newFilters.disability_id || newFilters.skill_id || newFilters.employment_type || newFilters.remote_type;
      
      // Always search when filter changes - backend handles "All" option
      const searchWithFilters = async () => {
        setLoading(true);
        try {
          const params = {
            query: searchQuery?.trim() || undefined,
            disability_id: newFilters.disability_id && newFilters.disability_id !== '' ? newFilters.disability_id : undefined,
            skill_id: newFilters.skill_id && newFilters.skill_id !== '' ? newFilters.skill_id : undefined,
            employment_type: newFilters.employment_type && newFilters.employment_type !== '' ? newFilters.employment_type : undefined,
            remote_type: newFilters.remote_type && newFilters.remote_type !== '' ? newFilters.remote_type : undefined,
          };
          const response = await jobAPI.searchJobs(params);
          setJobs(response.data?.results || response.data?.jobs || response.data || []);
        } catch (error) {
          handleAPIError(error);
          setJobs([]);
        } finally {
          setLoading(false);
        }
      };
      searchWithFilters();
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      disability_id: '',
      skill_id: '',
      employment_type: '',
      remote_type: '',
    });
    setSearchQuery('');
  };

  // Removed auto-search on filter change - now handled in handleFilterChange

  // Landing page for non-logged-in users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img 
                    src="/empowerwork-logo.png" 
                    alt="EmpowerWork - Opportunity for Every Ability" 
                    className="h-48 md:h-64 w-auto mx-auto drop-shadow-2xl"
                  />
                </div>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
                Your Gateway to Inclusive Employment
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Find meaningful job opportunities tailored to your skills and accessibility needs. 
                Join a platform designed to empower people with disabilities in their career journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg shadow-lg hover:from-teal-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-600"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose EmpowerWork?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We're committed to breaking down barriers and creating equal opportunities for everyone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-teal-600 dark:bg-teal-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Smart Job Matching
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI-powered job recommendations based on your skills, experience, and accessibility requirements
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-blue-600 dark:bg-blue-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Inclusive Community
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with employers committed to diversity, inclusion, and accessibility in the workplace
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-purple-600 dark:bg-purple-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  AI Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get personalized career advice and job search guidance from our intelligent chatbot
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-pink-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-pink-600 dark:bg-pink-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Assistive Tools
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access a comprehensive library of assistive tools and resources to support your work
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Your Career Journey Starts Here
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  EmpowerWork is more than just a job board. We're a comprehensive platform designed 
                  to support people with disabilities at every step of their career journey.
                </p>
                <div className="space-y-4">
                  {[
                    'Personalized job recommendations based on your profile',
                    'Accessibility-first design for all users',
                    'Comprehensive disability support system',
                    'Direct application tracking and management',
                    '24+ assistive tools and resources',
                    'AI-powered career guidance and support'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-8 shadow-2xl">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-6 w-6 text-pink-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">Inclusive by Design</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-6 w-6 text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">Secure & Private</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">AI-Powered Matching</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-700 dark:to-blue-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Find Your Dream Job?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Join thousands of job seekers who have found their perfect match through EmpowerWork
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teal-600 bg-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-teal-600 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
              >
                Sign In to Your Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Job search page for logged-in users
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Perfect Job
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover opportunities tailored to your skills and accessibility needs
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs by title, description, or skills..."
                      className="input-field pl-10"
                      aria-label="Search jobs"
                      aria-describedby="search-description"
                    />
                    <p id="search-description" className="sr-only">
                      Search for jobs by title, description, or required skills
                    </p>
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Disability Support
                  </label>
                  <select
                    value={filters.disability_id}
                    onChange={(e) => handleFilterChange('disability_id', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All</option>
                    {disabilities.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Skill
                  </label>
                  <select
                    value={filters.skill_id}
                    onChange={(e) => handleFilterChange('skill_id', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All</option>
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={filters.employment_type}
                    onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remote Type
                  </label>
                  <select
                    value={filters.remote_type}
                    onChange={(e) => handleFilterChange('remote_type', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            )}

            {showFilters && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery || filters.disability_id || filters.skill_id || filters.employment_type || filters.remote_type ? (
              <p className="text-gray-600 dark:text-gray-400">No jobs found matching your criteria. Try adjusting your search or filters.</p>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Enter a search query or select filters to find jobs.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Search by job title, skills, or use filters to narrow down results.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Found {jobs.length} job{jobs.length !== 1 ? 's' : ''} matching your criteria
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onApply={() => {
                    if (!user) {
                      toast.error('Please login to apply for jobs');
                      return;
                    }
                    setSelectedJob(job);
                    setShowApplicationModal(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && selectedJob && (
          <ApplicationModal
            job={selectedJob}
            isOpen={showApplicationModal}
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedJob(null);
            }}
            onSuccess={() => {
              // Refresh jobs or show success message
              toast.success('Application submitted successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Home;

