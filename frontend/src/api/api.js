import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: async (data, photoFile) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    const response = await api.post('/users/add_user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },
  login: async (data) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    const response = await api.post('/users/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// User endpoints
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: async (userId, data, photoFile) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== '') {
          formData.append(key, data[key]);
        }
      }
    });
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    return api.put(`/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAllUsers: () => api.get('/users'),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// Job endpoints
export const jobAPI = {
  addJob: (data) => {
    // Transform form data to match backend expectations
    const payload = {
      title: data.title,
      description: data.description,
      employment_type: data.employment_type,
      remote_type: data.remote_type,
      company_id: data.company_id || null,
      location_id: data.location_id || null,
      requirements: data.required_skills || [],
      disabilities: data.disability_support || [],
    };
    return api.post('/jobs/add_job', payload);
  },
  searchJobs: (params) => {
    // Transform frontend params to backend format
    const payload = {
      user_id: params.user_id || null,
      disability_ids: params.disability_id ? [params.disability_id] : params.disability_ids || null,
      skills: params.skill_id ? [params.skill_id] : params.skills || null,
      query: params.query || null,
      employment_type: params.employment_type || null,
      remote_type: params.remote_type || null,
    };
    return api.post('/jobs/search_jobs', payload);
  },
  getJob: (jobId) => api.get(`/jobs/${jobId}`),
  updateJob: (jobId, data) => api.put(`/jobs/${jobId}`, data),
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`),
  getAllJobs: () => api.get('/jobs'),
};

// Company endpoints
export const companyAPI = {
  addCompany: (data) => api.post('/companies', data),
  getAllCompanies: () => api.get('/companies'),
  getCompany: (companyId) => api.get(`/companies/${companyId}`),
  updateCompany: (companyId, data) => api.put(`/companies/${companyId}`, data),
  deleteCompany: (companyId) => api.delete(`/companies/${companyId}`),
};

// Chat endpoint
export const chatAPI = {
  sendMessage: (data) => {
    // Backend expects user_id and message as query params
    const params = new URLSearchParams();
    if (data.user_id) params.append('user_id', data.user_id);
    params.append('message', data.message);
    return api.post(`/chat/?${params.toString()}`);
  },
  speechToText: (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    return api.post('/chat/speech-to-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Application endpoints
export const applicationAPI = {
  applyForJob: (jobId, userId, coverLetter, cvFile) => {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('user_id', userId);
    if (coverLetter) formData.append('cover_letter', coverLetter);
    formData.append('cv', cvFile);
    return api.post('/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  applyForJobManual: (jobId, userId, coverLetter, manualInfo) => {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('user_id', userId);
    if (coverLetter) formData.append('cover_letter', coverLetter);
    formData.append('manual_info', JSON.stringify(manualInfo));
    return api.post('/applications/apply_manual', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUserApplications: (userId) => api.get(`/applications/user/${userId}`),
  getJobApplications: (jobId, status) => {
    const params = status ? { status } : {};
    return api.get(`/applications/job/${jobId}`, { params });
  },
  getPendingApplications: () => api.get('/applications/pending'),
  reviewApplication: (applicationId, status, adminNotes, reviewerId) => {
    const formData = new FormData();
    formData.append('status', status);
    formData.append('reviewer_id', reviewerId);
    if (adminNotes) formData.append('admin_notes', adminNotes);
    return api.put(`/applications/${applicationId}/review`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getApplication: (applicationId) => api.get(`/applications/${applicationId}`),
};

// Skills endpoints
export const skillAPI = {
  getAllSkills: () => api.get('/skills'),
  addSkill: (data) => api.post('/skills', data),
  deleteSkill: (skillId) => api.delete(`/skills/${skillId}`),
};

// Disabilities endpoints
export const disabilityAPI = {
  getAllDisabilities: () => api.get('/disabilities'),
  getDisability: (disabilityId) => api.get(`/disabilities/${disabilityId}`),
  addDisability: (data) => api.post('/disabilities', data),
  updateDisability: (disabilityId, data) => api.put(`/disabilities/${disabilityId}`, data),
  deleteDisability: (disabilityId) => api.delete(`/disabilities/${disabilityId}`),
  getCategories: () => api.get('/disabilities/categories/list'),
};

// Assistive Tools endpoints
export const toolsAPI = {
  getAllTools: (params) => {
    const queryParams = new URLSearchParams();
    if (params?.disability_id) queryParams.append('disability_id', params.disability_id);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.cost) queryParams.append('cost', params.cost);
    return api.get(`/tools?${queryParams.toString()}`);
  },
  getToolsForUser: (userId) => api.get(`/tools/for-user/${userId}`),
  getTool: (toolId) => api.get(`/tools/${toolId}`),
  addTool: (data) => api.post('/tools', data),
  updateTool: (toolId, data) => api.put(`/tools/${toolId}`, data),
  deleteTool: (toolId) => api.delete(`/tools/${toolId}`),
};

// Security endpoints
export const securityAPI = {
  getSecurityLogs: (params) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit);
    if (params?.offset) queryParams.append('offset', params.offset);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.threat_type) queryParams.append('threat_type', params.threat_type);
    return api.get(`/security/logs?${queryParams.toString()}`);
  },
  getSecurityStats: (days = 7) => api.get(`/security/stats?days=${days}`),
  detectThreat: (data) => api.post('/security/detect', data),
  deleteSecurityLog: (logId) => api.delete(`/security/logs/${logId}`),
};

// Helper function for error handling
export const handleAPIError = (error) => {
  const message = error.response?.data?.detail || error.message || 'An error occurred';
  toast.error(message);
  return message;
};

export default api;

