import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Search, Filter, Download } from 'lucide-react';
import { toolsAPI, disabilityAPI } from '../api/api';
import { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';

const Tools = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [toolsByCategory, setToolsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [costFilter, setCostFilter] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTools();
  }, [user, navigate]);

  useEffect(() => {
    filterTools();
  }, [tools, searchQuery, categoryFilter, platformFilter, costFilter]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await toolsAPI.getToolsForUser(user.id);
      setToolsByCategory(response.data?.tools_by_category || {});
      
      // Flatten tools for filtering
      const allTools = [];
      Object.values(response.data?.tools_by_category || {}).forEach(categoryTools => {
        allTools.push(...categoryTools);
      });
      setTools(allTools);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tool_type && t.tool_type.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (platformFilter) {
      filtered = filtered.filter(t =>
        t.platform && (
          t.platform.toLowerCase().includes(platformFilter.toLowerCase()) ||
          t.platform === "All"
        )
      );
    }

    if (costFilter) {
      filtered = filtered.filter(t => t.cost === costFilter);
    }

    // Group filtered tools by category
    const grouped = {};
    filtered.forEach(tool => {
      const category = tool.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(tool);
    });

    setToolsByCategory(grouped);
  };

  const getCostBadgeColor = (cost) => {
    switch (cost) {
      case "Free":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Freemium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Subscription":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Assistive Tools & Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tools and resources recommended based on your disabilities
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="input-field pl-10"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="Software">Software</option>
                <option value="App">App</option>
                <option value="Hardware">Hardware</option>
                <option value="Service">Service</option>
                <option value="Resource">Resource</option>
              </select>
            </div>
            <div>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Platforms</option>
                <option value="Windows">Windows</option>
                <option value="Mac">Mac</option>
                <option value="iOS">iOS</option>
                <option value="Android">Android</option>
                <option value="Web">Web</option>
              </select>
            </div>
            <div>
              <select
                value={costFilter}
                onChange={(e) => setCostFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Costs</option>
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
                <option value="Subscription">Subscription</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tools by Category */}
        {Object.keys(toolsByCategory).length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No tools found matching your criteria.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Make sure you've selected disabilities in your profile to get personalized tool recommendations.
            </p>
          </div>
        ) : (
          Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {category} Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTools.map((tool) => (
                  <div key={tool.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {tool.icon && <span className="text-2xl">{tool.icon}</span>}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {tool.name}
                        </h3>
                      </div>
                      {tool.cost && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCostBadgeColor(tool.cost)}`}>
                          {tool.cost}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {tool.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {tool.tool_type && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Type:</span> {tool.tool_type}
                        </div>
                      )}
                      {tool.platform && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Platform:</span> {tool.platform}
                        </div>
                      )}
                      {tool.features && tool.features.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Features:</span> {tool.features.slice(0, 2).join(", ")}
                          {tool.features.length > 2 && "..."}
                        </div>
                      )}
                    </div>
                    
                    {tool.website_url && (
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tools;

