import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import JobForm from '../components/JobForm';
import { jobAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const AdminJobs = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchJobs();
  }, [user, isAdmin, navigate]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getAllJobs();
      setJobs(response.data || []);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobAPI.deleteJob(jobId);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      handleAPIError(error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingJob) {
        await jobAPI.updateJob(editingJob.id, formData);
        toast.success('Job updated successfully');
      } else {
        await jobAPI.addJob(formData);
        toast.success('Job created successfully');
      }
      setShowForm(false);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      throw error;
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    {
      key: 'company_name',
      label: 'Company',
      render: (value) => value || '-',
    },
    {
      key: 'location_city',
      label: 'Location',
      render: (value, row) =>
        value
          ? `${value}${row.location_country ? `, ${row.location_country}` : ''}`
          : '-',
    },
    {
      key: 'employment_type',
      label: 'Type',
      render: (value) => (value ? value.replace('-', ' ') : '-'),
    },
    {
      key: 'remote_type',
      label: 'Remote',
      render: (value) => (value === 'remote' ? 'Yes' : 'No'),
    },
    {
      key: 'salary_min',
      label: 'Salary',
      render: (value, row) =>
        value
          ? `$${value}${row.salary_max ? ` - $${row.salary_max}` : '+'}`
          : '-',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Jobs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add, edit, and delete job listings
            </p>
          </div>
          <button
            onClick={() => {
              setEditingJob(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Job</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingJob(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <JobForm
              job={editingJob}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingJob(null);
              }}
            />
          </div>
        )}

        <div className="card">
          <Table
            data={jobs}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;

