import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import { companyAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const AdminCompanies = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchCompanies();
  }, [user, isAdmin, navigate]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companyAPI.getAllCompanies();
      setCompanies(response.data || []);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      website: company.website || '',
      contact_email: company.contact_email || '',
      contact_phone: company.contact_phone || '',
      address: company.address || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await companyAPI.deleteCompany(companyId);
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      handleAPIError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await companyAPI.updateCompany(editingCompany.id, formData);
        toast.success('Company updated successfully');
      } else {
        await companyAPI.addCompany(formData);
        toast.success('Company created successfully');
      }
      setShowForm(false);
      setEditingCompany(null);
      setFormData({
        name: '',
        website: '',
        contact_email: '',
        contact_phone: '',
        address: '',
      });
      fetchCompanies();
    } catch (error) {
      handleAPIError(error);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'website', label: 'Website', render: (value) => value || '-' },
    { key: 'contact_email', label: 'Email', render: (value) => value || '-' },
    { key: 'contact_phone', label: 'Phone', render: (value) => value || '-' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading companies...</p>
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
              Manage Companies
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add, edit, and delete company information
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCompany(null);
              setFormData({
                name: '',
                website: '',
                contact_email: '',
                contact_phone: '',
                address: '',
              });
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Company</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCompany(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCompany(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCompany ? 'Update' : 'Create'} Company
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <Table
            data={companies}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminCompanies;

