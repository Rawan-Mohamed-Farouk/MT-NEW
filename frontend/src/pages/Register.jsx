import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { handleAPIError, disabilityAPI, skillAPI } from '../api/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    disabilities: [],
    skills: [],
  });
  const [customDisabilities, setCustomDisabilities] = useState([]); // Store custom disability names
  const [customSkills, setCustomSkills] = useState([]); // Store custom skill names
  const [newDisabilityName, setNewDisabilityName] = useState('');
  const [newDisabilityCategory, setNewDisabilityCategory] = useState('Other');
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddDisability, setShowAddDisability] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [disabilities, setDisabilities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Try to add custom disabilities and skills first
      const disabilityIds = [...formData.disabilities];
      const skillIds = [...formData.skills];
      

      
      // Try to add custom skills
      for (const customSkill of customSkills) {
        try {
          const response = await skillAPI.addSkill({ name: customSkill });
          if (response.data?.id) {
            skillIds.push(response.data.id);
            toast.success(`Added "${customSkill}" to skills`);
          }
        } catch (error) {
          // If adding fails, show message but continue
          toast.error(`Could not add "${customSkill}" - may need admin approval`);
          console.log('Could not add custom skill:', error);
        }
      }
      
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        disabilities: disabilityIds,
        skills: skillIds,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join EmpowerWork and find your perfect job
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                className="input-field"
                placeholder="••••••••"
              />
            </div>



            {/* Skills Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddSkill(!showAddSkill)}
                  className="text-xs text-accent hover:underline"
                >
                  + Add Custom
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Select your skills to help match you with relevant jobs.
              </p>
              
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
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                {skills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            skills: [...formData.skills, skill.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            skills: formData.skills.filter(id => id !== skill.id),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {skill.name}
                    </span>
                  </label>
                ))}
              </div>
              {skills.length === 0 && (
                <div className="text-center py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading skills...
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

