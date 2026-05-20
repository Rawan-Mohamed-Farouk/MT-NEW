import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Building2, FileText, TrendingUp, Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { userAPI, jobAPI, companyAPI, applicationAPI, securityAPI } from '../api/api';
import { handleAPIError } from '../api/api';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    companies: 0,
    applications: 0,
  });
  const [securityStats, setSecurityStats] = useState({
    total_logs: 0,
    critical_logs: 0,
    blocked_attempts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, isAdmin, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, jobsRes, companiesRes, appsRes, securityRes] = await Promise.all([
        userAPI.getAllUsers(),
        jobAPI.getAllJobs(),
        companyAPI.getAllCompanies(),
        applicationAPI.getPendingApplications().catch(() => ({ data: { applications: [] } })),
        securityAPI.getSecurityStats(7).catch(() => ({ data: {} })),
      ]);
      setStats({
        users: usersRes.data?.length || 0,
        jobs: jobsRes.data?.results?.length || jobsRes.data?.length || 0,
        companies: companiesRes.data?.length || 0,
        applications: appsRes.data?.applications?.length || 0,
      });
      setSecurityStats({
        total_logs: securityRes.data?.total_logs || 0,
        critical_logs: securityRes.data?.critical_logs || 0,
        blocked_attempts: securityRes.data?.blocked_attempts || 0,
      });
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Total Jobs',
      value: stats.jobs,
      icon: Briefcase,
      color: 'bg-green-500',
      link: '/admin/jobs',
    },
    {
      title: 'Companies',
      value: stats.companies,
      icon: Building2,
      color: 'bg-purple-500',
      link: '/admin/companies',
    },
    {
      title: 'Pending Applications',
      value: stats.applications,
      icon: FileText,
      color: 'bg-orange-500',
      link: '/admin/applications',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Comprehensive system management and monitoring
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg border border-green-300 dark:border-green-700">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">System Operational</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              onClick={() => navigate(stat.link)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {stat.title}
                  </span>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  <span>View Details →</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Security Card */}
          <div
            onClick={() => navigate('/admin/security')}
            className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                  Security
                </span>
              </div>
              <p className="text-4xl font-bold mb-2">
                {securityStats.critical_logs > 0 ? (
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8" />
                    {securityStats.critical_logs}
                  </span>
                ) : (
                  <CheckCircle className="h-8 w-8" />
                )}
              </p>
              <div className="flex items-center text-sm opacity-90">
                <Activity className="h-4 w-4 mr-1" />
                <span>{securityStats.total_logs} logs • {securityStats.blocked_attempts} blocked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions - Enhanced */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group"
              >
                <Users className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Manage Users</span>
              </button>
              <button
                onClick={() => navigate('/admin/jobs')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group"
              >
                <Briefcase className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Manage Jobs</span>
              </button>
              <button
                onClick={() => navigate('/admin/companies')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group"
              >
                <Building2 className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Manage Companies</span>
              </button>
              <button
                onClick={() => navigate('/admin/disabilities')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group"
              >
                <FileText className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Manage Disabilities</span>
              </button>
              <button
                onClick={() => navigate('/admin/applications')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group"
              >
                <FileText className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Review Applications</span>
              </button>
              <button
                onClick={() => navigate('/admin/security')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-3 group border-2 border-red-200 dark:border-red-800"
              >
                <Shield className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Security Monitoring</span>
                {securityStats.critical_logs > 0 && (
                  <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                    {securityStats.critical_logs}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Security Overview */}
          <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Security Overview
            </h2>
            <div className="space-y-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Total Security Logs</span>
                  <Activity className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold">{securityStats.total_logs}</p>
                <p className="text-xs opacity-75 mt-1">Last 7 days</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Critical Threats</span>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold">{securityStats.critical_logs}</p>
                <p className="text-xs opacity-75 mt-1">Requires attention</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Blocked Attempts</span>
                  <CheckCircle className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold">{securityStats.blocked_attempts}</p>
                <p className="text-xs opacity-75 mt-1">Successfully prevented</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/security')}
              className="w-full mt-4 bg-white text-red-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Security Logs →
            </button>
          </div>

          {/* System Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              System Analytics
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Users per Disability</span>
                  <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Active</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Applications</span>
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.applications}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending review</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Jobs</span>
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.jobs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total listings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

