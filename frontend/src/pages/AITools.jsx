import { useState, useEffect } from 'react';
import { Sparkles, Mic, Volume2, Languages, FileText, MessageSquare, Video, CheckCircle, ExternalLink, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AITools = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);

  // AI Tools categories
  const categories = [
    { id: 'all', name: 'All Tools', icon: Sparkles },
    { id: 'speech', name: 'Speech-to-Text', icon: Mic },
    { id: 'voice', name: 'Text-to-Speech', icon: Volume2 },
    { id: 'translation', name: 'Translation', icon: Languages },
    { id: 'writing', name: 'Writing Assistant', icon: FileText },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'interview', name: 'Interview Prep', icon: Video },
    { id: 'resume', name: 'Resume/CV', icon: FileText },
  ];

  // AI Tools data
  const aiTools = [
    // Speech-to-Text Tools
    {
      id: 1,
      name: 'Otter.ai',
      category: 'speech',
      description: 'AI-powered real-time transcription for meetings and conversations. Perfect for deaf/hard of hearing users.',
      features: ['Real-time transcription', 'Meeting notes', 'Speaker identification', 'Search transcripts'],
      platform: 'Web, iOS, Android',
      cost: 'Freemium',
      website: 'https://otter.ai',
      icon: '🎤',
      disabilitySupport: ['Deaf', 'Hard of Hearing'],
    },
    {
      id: 2,
      name: 'Google Live Transcribe',
      category: 'speech',
      description: 'Real-time speech-to-text conversion. Converts spoken words to text instantly on your device.',
      features: ['Real-time transcription', 'Offline support', 'Multiple languages', 'Noise filtering'],
      platform: 'Android',
      cost: 'Free',
      website: 'https://play.google.com/store/apps/details?id=com.google.audio.hearing.visualization.accessibility.scribe',
      icon: '📱',
      disabilitySupport: ['Deaf', 'Hard of Hearing'],
    },
    {
      id: 3,
      name: 'Microsoft Speech Services',
      category: 'speech',
      description: 'Azure-based speech-to-text API for real-time and batch transcription. Great for workplace integration.',
      features: ['Real-time transcription', 'Batch processing', 'Custom models', 'Multiple languages'],
      platform: 'Web, API',
      cost: 'Paid',
      website: 'https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/',
      icon: '☁️',
      disabilitySupport: ['Deaf', 'Hard of Hearing', 'Speech Impairment'],
    },
    
    // Text-to-Speech Tools
    {
      id: 4,
      name: 'Natural Reader',
      category: 'voice',
      description: 'AI text-to-speech with natural voices. Reads documents, web pages, and emails aloud.',
      features: ['Natural voices', 'Multiple languages', 'OCR for images', 'Browser extension'],
      platform: 'Web, Windows, Mac, iOS, Android',
      cost: 'Freemium',
      website: 'https://www.naturalreaders.com',
      icon: '🔊',
      disabilitySupport: ['Blind', 'Low Vision', 'Dyslexia', 'ADHD'],
    },
    {
      id: 5,
      name: 'Voice Dream Reader',
      category: 'voice',
      description: 'Advanced text-to-speech app with highlighting and note-taking. Perfect for reading documents.',
      features: ['High-quality voices', 'Text highlighting', 'Note-taking', 'Cloud sync'],
      platform: 'iOS, Android',
      cost: 'Paid',
      website: 'https://www.voicedream.com',
      icon: '📖',
      disabilitySupport: ['Blind', 'Low Vision', 'Dyslexia'],
    },
    
    // Translation Tools
    {
      id: 6,
      name: 'Google Translate',
      category: 'translation',
      description: 'AI-powered translation for 100+ languages. Real-time conversation translation.',
      features: ['100+ languages', 'Real-time translation', 'Camera translation', 'Offline mode'],
      platform: 'Web, iOS, Android',
      cost: 'Free',
      website: 'https://translate.google.com',
      icon: '🌐',
      disabilitySupport: ['All'],
    },
    {
      id: 7,
      name: 'DeepL Translator',
      category: 'translation',
      description: 'Advanced AI translation with superior accuracy. Best for professional communication.',
      features: ['High accuracy', 'Document translation', 'Multiple languages', 'Context awareness'],
      platform: 'Web, Windows, Mac, iOS, Android',
      cost: 'Freemium',
      website: 'https://www.deepl.com',
      icon: '🤖',
      disabilitySupport: ['All'],
    },
    
    // Writing Assistant Tools
    {
      id: 8,
      name: 'Grammarly',
      category: 'writing',
      description: 'AI writing assistant that helps improve grammar, clarity, and tone. Great for emails and documents.',
      features: ['Grammar checking', 'Style suggestions', 'Tone detection', 'Plagiarism check'],
      platform: 'Web, Windows, Mac, Browser Extension',
      cost: 'Freemium',
      website: 'https://www.grammarly.com',
      icon: '✍️',
      disabilitySupport: ['Dyslexia', 'ADHD', 'All'],
    },
    {
      id: 9,
      name: 'Jasper AI',
      category: 'writing',
      description: 'AI content writer that helps create professional emails, cover letters, and documents.',
      features: ['Content generation', 'Email templates', 'Tone adjustment', 'Multi-language'],
      platform: 'Web',
      cost: 'Paid',
      website: 'https://www.jasper.ai',
      icon: '✏️',
      disabilitySupport: ['Dyslexia', 'ADHD', 'All'],
    },
    {
      id: 10,
      name: 'ChatGPT',
      category: 'writing',
      description: 'AI assistant for writing, editing, and improving text. Helps with job applications and communication.',
      features: ['Text generation', 'Editing assistance', 'Idea generation', 'Conversational AI'],
      platform: 'Web, iOS, Android',
      cost: 'Freemium',
      website: 'https://chat.openai.com',
      icon: '💬',
      disabilitySupport: ['All'],
    },
    
    // Communication Tools
    {
      id: 11,
      name: 'Ava',
      category: 'communication',
      description: 'Real-time captioning for group conversations. Shows who said what in meetings.',
      features: ['Group captions', 'Speaker identification', 'Save transcripts', 'Multiple languages'],
      platform: 'iOS, Android',
      cost: 'Freemium',
      website: 'https://www.ava.me',
      icon: '💬',
      disabilitySupport: ['Deaf', 'Hard of Hearing'],
    },
    {
      id: 12,
      name: 'Microsoft Translator',
      category: 'communication',
      description: 'Real-time conversation translation. Break language barriers in workplace communication.',
      features: ['Conversation mode', 'Multi-person translation', 'Offline support', 'Text, voice, image'],
      platform: 'Web, iOS, Android',
      cost: 'Free',
      website: 'https://www.microsoft.com/en-us/translator',
      icon: '🌍',
      disabilitySupport: ['All'],
    },
    
    // Interview Preparation Tools
    {
      id: 13,
      name: 'Interview Warmup',
      category: 'interview',
      description: 'Google AI tool that helps practice job interviews with AI feedback on answers.',
      features: ['Practice interviews', 'AI feedback', 'Common questions', 'Answer analysis'],
      platform: 'Web',
      cost: 'Free',
      website: 'https://grow.google/certificates/interview-warmup',
      icon: '🎯',
      disabilitySupport: ['Anxiety Disorder', 'Autism Spectrum Disorder', 'All'],
    },
    {
      id: 14,
      name: 'Big Interview',
      category: 'interview',
      description: 'AI-powered interview practice platform with personalized feedback and coaching.',
      features: ['Mock interviews', 'AI feedback', 'Video practice', 'Answer suggestions'],
      platform: 'Web',
      cost: 'Paid',
      website: 'https://www.biginterview.com',
      icon: '🎥',
      disabilitySupport: ['Anxiety Disorder', 'All'],
    },
    
    // Resume/CV Tools
    {
      id: 15,
      name: 'Resume.io AI',
      category: 'resume',
      description: 'AI-powered resume builder that creates professional resumes tailored to job descriptions.',
      features: ['AI resume builder', 'ATS optimization', 'Job matching', 'Cover letter generator'],
      platform: 'Web',
      cost: 'Freemium',
      website: 'https://resume.io',
      icon: '📄',
      disabilitySupport: ['All'],
    },
    {
      id: 16,
      name: 'Rezi AI',
      category: 'resume',
      description: 'AI resume writer that optimizes your resume for ATS systems and job applications.',
      features: ['ATS optimization', 'Keyword matching', 'Resume scoring', 'Job-specific resumes'],
      platform: 'Web',
      cost: 'Freemium',
      website: 'https://www.rezi.ai',
      icon: '📝',
      disabilitySupport: ['All'],
    },
    {
      id: 17,
      name: 'Enhancv',
      category: 'resume',
      description: 'AI-powered resume builder with smart suggestions and ATS-friendly templates.',
      features: ['Smart suggestions', 'ATS-friendly', 'Visual templates', 'Cover letter builder'],
      platform: 'Web',
      cost: 'Freemium',
      website: 'https://enhancv.com',
      icon: '✨',
      disabilitySupport: ['All'],
    },
  ];

  useEffect(() => {
    // Filter tools based on search and category
    let filtered = aiTools;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setTools(filtered);
  }, [searchQuery, selectedCategory]);

  const handleToolClick = (tool) => {
    window.open(tool.website, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${tool.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Tools for Jobs & Communication
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover AI-powered tools that help people with disabilities excel in their jobs and improve communication.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search AI tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-accent text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        {tools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tools found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{tool.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {tool.name}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded bg-accent/10 text-accent">
                        {categories.find(c => c.id === tool.category)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {tool.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Features:
                  </h4>
                  <ul className="space-y-1">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>Platform: {tool.platform}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                    {tool.cost}
                  </span>
                </div>

                {tool.disabilitySupport && tool.disabilitySupport.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Supports:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tool.disabilitySupport.map((disability, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          {disability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleToolClick(tool)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            About AI Tools for Disabilities
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            These AI-powered tools are designed to help people with disabilities succeed in the workplace and improve communication. 
            From speech-to-text for deaf users to writing assistants for dyslexia, these tools break down barriers and create 
            more inclusive work environments. All tools are selected for their accessibility features and effectiveness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AITools;

