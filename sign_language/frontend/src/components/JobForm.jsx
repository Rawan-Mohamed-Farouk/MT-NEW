import { useState, useEffect } from 'react';
import { companyAPI, disabilityAPI, skillAPI } from '../api/api';
import toast from 'react-hot-toast';

const JobForm = ({ job, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    location_city: '',
    location_country: '',
    employment_type: 'full-time',
    remote_type: 'on-site',
    salary_min: '',
    salary_max: '',
    required_skills: [],
    disability_support: [],
    application_url: '',
  });
  const [companies, setCompanies] = useState([]);
  const [disabilities, setDisabilities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        company_id: job.company_id || '',
        location_city: job.location_city || '',
        location_country: job.location_country || '',
        employment_type: job.employment_type || 'full-time',
        remote_type: job.remote_type || 'on-site',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        required_skills: job.required_skills || [],
        disability_support: job.disability_support || [],
        application_url: job.application_url || '',
      });
    }
  }, [job]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, disabilitiesRes, skillsRes] = await Promise.all([
          companyAPI.getAllCompanies(),
          disabilityAPI.getAllDisabilities(),
          skillAPI.getAllSkills(),
        ]);
        setCompanies(companiesRes.data || []);
        setDisabilities(disabilitiesRes.data || []);
        setSkills(skillsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skillId)
        ? prev.required_skills.filter(id => id !== skillId)
        : [...prev.required_skills, skillId],
    }));
  };

  const handleDisabilityToggle = (disabilityId) => {
    setFormData(prev => ({
      ...prev,
      disability_support: prev.disability_support.includes(disabilityId)
        ? prev.disability_support.filter(id => id !== disabilityId)
        : [...prev.disability_support, disabilityId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success('Job saved successfully!');
    } catch (error) {
      toast.error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company *
          </label>
          <select
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select Company...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employment Type *
          </label>
          <select
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Remote Type *
          </label>
          <select
            name="remote_type"
            value={formData.remote_type}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="on-site">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            name="location_city"
            value={formData.location_city}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country
          </label>
          <input
            type="text"
            name="location_country"
            value={formData.location_country}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salary Min
          </label>
          <input
            type="number"
            name="salary_min"
            value={formData.salary_min}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salary Max
          </label>
          <input
            type="number"
            name="salary_max"
            value={formData.salary_max}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application URL
          </label>
          <input
            type="url"
            name="application_url"
            value={formData.application_url}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={6}
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Required Skills
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          {skills.map((skill) => (
            <label
              key={skill.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.required_skills.includes(skill.id)}
                onChange={() => handleSkillToggle(skill.id)}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {skill.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Disability Support
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          {disabilities.map((disability) => (
            <label
              key={disability.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.disability_support.includes(disability.id)}
                onChange={() => handleDisabilityToggle(disability.id)}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {disability.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;

