import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Filter, Download, Trash2 } from 'lucide-react';
import { securityAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';

const AdminSecurity = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    threat_type: '',
    limit: 100,
  });

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, isAdmin, navigate, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        securityAPI.getSecurityLogs(filters),
        securityAPI.getSecurityStats(7),
      ]);
      setLogs(logsRes.data?.logs || []);
      setStats(statsRes.data);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  };

  const getThreatIcon = (threatType) => {
    if (!threatType) return <Activity className="h-4 w-4" />;
    if (threatType.includes('sql') || threatType.includes('injection')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (threatType.includes('brute') || threatType.includes('force')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Shield className="h-4 w-4 text-blue-500" />;
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this security log?')) {
      return;
    }
    try {
      await securityAPI.deleteSecurityLog(logId);
      toast.success('Security log deleted');
      fetchData();
    } catch (error) {
      handleAPIError(error);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                Security Monitoring
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor system security, detect threats, and view security logs
              </p>
            </div>
            <button
              onClick={fetchData}
              className="btn-primary flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.total_logs || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                </div>
                <Activity className="h-12 w-12 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Threats</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                    {stats.critical_logs || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requires attention</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked Attempts</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {stats.blocked_attempts || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Successfully blocked</p>
                </div>
                <Shield className="h-12 w-12 text-orange-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    Secure
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All systems operational</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="input-field"
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filters.threat_type}
              onChange={(e) => setFilters({ ...filters, threat_type: e.target.value })}
              className="input-field"
            >
              <option value="">All Threat Types</option>
              <option value="sql_injection">SQL Injection</option>
              <option value="xss">XSS Attack</option>
              <option value="brute_force">Brute Force</option>
              <option value="rate_limit">Rate Limit Exceeded</option>
              <option value="suspicious_activity">Suspicious Activity</option>
            </select>
            <button
              onClick={() => setFilters({ severity: '', threat_type: '', limit: 100 })}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Security Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Threat Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Detected By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No security logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-300">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getThreatIcon(log.threat_type)}
                          <span className="text-sm text-gray-900 dark:text-gray-300">
                            {log.threat_type || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                          {log.detected_by}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.blocked ? (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs font-medium">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                            Allowed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                          title="Delete log"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Threat Type Distribution */}
        {stats && stats.threat_types && Object.keys(stats.threat_types).length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Threat Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.threat_types).map(([threat, count]) => (
                <div key={threat} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{threat}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSecurity;

