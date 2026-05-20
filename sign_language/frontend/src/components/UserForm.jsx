import { useState, useEffect } from 'react';
import { disabilityAPI, skillAPI } from '../api/api';
import toast from 'react-hot-toast';
import { Camera, User, Plus, X } from 'lucide-react';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    phone: '',
    disabilities: [],
    skills: [],
  });
  const [customDisabilities, setCustomDisabilities] = useState([]);
  const [customSkills, setCustomSkills] = useState([]);
  const [newDisabilityName, setNewDisabilityName] = useState('');
  const [newDisabilityCategory, setNewDisabilityCategory] = useState('Other');
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddDisability, setShowAddDisability] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [disabilities, setDisabilities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        age: user.age || '',
        gender: user.gender || '',
        phone: user.phone || '',
        disabilities: user.disabilities?.map(d => typeof d === 'object' ? d.id : d) || [],
        skills: user.skills?.map(s => typeof s === 'object' ? s.id : s) || [],
      });
      if (user.photo) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        setPhotoPreview(`${apiUrl}${user.photo}`);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disabilitiesRes, skillsRes] = await Promise.all([
          disabilityAPI.getAllDisabilities(),
          skillAPI.getAllSkills(),
        ]);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDisabilityToggle = (disabilityId) => {
    setFormData(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(disabilityId)
        ? prev.disabilities.filter(id => id !== disabilityId)
        : [...prev.disabilities, disabilityId],
    }));
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try to add custom disabilities and skills first
      let disabilityIds = [...formData.disabilities];
      let skillIds = [...formData.skills];
      
      // Add custom disabilities
      for (const customDis of customDisabilities) {
        try {
          const response = await disabilityAPI.addDisability({
            name: customDis.name,
            category: customDis.category || 'Other',
            description: `User-added disability: ${customDis.name}`,
          });
          if (response.data?.id) {
            disabilityIds.push(response.data.id);
          }
        } catch (error) {
          toast.error(`Could not add "${customDis.name}" - may need admin approval`);
          console.log('Could not add custom disability:', error);
        }
      }
      
      // Add custom skills
      for (const customSkill of customSkills) {
        try {
          const response = await skillAPI.addSkill({ name: customSkill });
          if (response.data?.id) {
            skillIds.push(response.data.id);
          }
        } catch (error) {
          toast.error(`Could not add "${customSkill}" - may need admin approval`);
          console.log('Could not add custom skill:', error);
        }
      }
      
      await onSubmit({ ...formData, disabilities: disabilityIds, skills: skillIds }, photoFile);
      toast.success('Profile saved successfully!');
      // Clear custom entries after successful save
      setCustomDisabilities([]);
      setCustomSkills([]);
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt={`${formData.name || 'User'}'s profile photo`}
              className="w-32 h-32 rounded-full object-cover border-4 border-accent"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-300 dark:border-gray-600" aria-hidden="true">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <label
            htmlFor="photo-upload"
            className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
          >
            <Camera className="h-4 w-4" />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Click camera icon to upload profile photo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            aria-required="true"
            aria-describedby="name-description"
          />
          <p id="name-description" className="sr-only">Enter your full name</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
            aria-required="true"
            aria-describedby="email-description"
            autoComplete="email"
          />
          <p id="email-description" className="sr-only">Enter your email address</p>
        </div>

        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              minLength={8}
              className="input-field"
            />
          </div>
        )}

        {user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              className="input-field"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Disabilities *
          </label>
          <button
            type="button"
            onClick={() => setShowAddDisability(!showAddDisability)}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Custom
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Select all that apply. This helps us recommend the best jobs for you.
        </p>
        
        {/* Add Custom Disability Form */}
        {showAddDisability && (
          <div className="mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDisabilityName}
                onChange={(e) => setNewDisabilityName(e.target.value)}
                placeholder="Enter disability name"
                className="flex-1 input-field text-sm"
              />
              <select
                value={newDisabilityCategory}
                onChange={(e) => setNewDisabilityCategory(e.target.value)}
                className="input-field text-sm"
              >
                <option value="Sensory">Sensory</option>
                <option value="Cognitive">Cognitive</option>
                <option value="Physical">Physical</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Other">Other</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (newDisabilityName.trim()) {
                    const customDis = {
                      name: newDisabilityName.trim(),
                      category: newDisabilityCategory,
                      id: `custom-${Date.now()}`,
                    };
                    setCustomDisabilities([...customDisabilities, customDis]);
                    setNewDisabilityName('');
                    setShowAddDisability(false);
                    toast.success('Custom disability added!');
                  }
                }}
                className="btn-primary text-sm px-3 py-1"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddDisability(false);
                  setNewDisabilityName('');
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Display Custom Disabilities */}
        {customDisabilities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Custom Disabilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {customDisabilities.map((customDis, idx) => (
                <div
                  key={customDis.id}
                  className="flex items-center space-x-2 px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full text-sm"
                >
                  <span>{customDis.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDisabilities(customDisabilities.filter((_, i) => i !== idx));
                    }}
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Group by category */}
        {['Sensory', 'Cognitive', 'Physical', 'Mental Health', 'Other'].map((category) => {
          const categoryDisabilities = disabilities.filter(d => d.category === category);
          if (categoryDisabilities.length === 0) return null;
          
          return (
            <div key={category} className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {category} Disabilities
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                {categoryDisabilities.map((disability) => (
                  <label
                    key={disability.id}
                    className="flex items-start space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.disabilities.includes(disability.id)}
                      onChange={() => handleDisabilityToggle(disability.id)}
                      className="mt-1 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        {disability.icon && <span className="mr-1">{disability.icon}</span>}
                        {disability.name}
                      </span>
                      {disability.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {disability.description.substring(0, 60)}...
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
        
        {disabilities.length === 0 && (
          <div className="text-center py-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No disabilities available. Please contact admin to add disabilities.
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Skills
          </label>
          <button
            type="button"
            onClick={() => setShowAddSkill(!showAddSkill)}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Custom
          </button>
        </div>
        
        {/* Add Custom Skill Form */}
        {showAddSkill && (
          <div className="mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Enter skill name"
                className="flex-1 input-field text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSkillName.trim()) {
                      setCustomSkills([...customSkills, newSkillName.trim()]);
                      setNewSkillName('');
                      setShowAddSkill(false);
                      toast.success('Custom skill added!');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSkillName.trim()) {
                    setCustomSkills([...customSkills, newSkillName.trim()]);
                    setNewSkillName('');
                    setShowAddSkill(false);
                    toast.success('Custom skill added!');
                  }
                }}
                className="btn-primary text-sm px-3 py-1"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddSkill(false);
                  setNewSkillName('');
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Display Custom Skills */}
        {customSkills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Custom Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {customSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSkills(customSkills.filter((_, i) => i !== idx));
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          {skills.map((skill) => (
            <label
              key={skill.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.skills.includes(skill.id)}
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
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
