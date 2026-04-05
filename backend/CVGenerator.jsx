import { useState, useRef } from 'react';
import { Mic, MicOff, FileText, Download, Loader2 } from 'lucide-react';
import { cvAPI, handleAPIError } from '../api/api';
import toast from 'react-hot-toast';

const CVGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    experience: '',
    education: '',
    skills: ''
  });

  const [isRecording, setIsRecording] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'experience' or 'education'
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Audio recording refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startRecording = async (field) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob, field);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setActiveField(field);
      toast.success('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob, field) => {
    setIsTranscribing(true);
    try {
      const response = await cvAPI.transcribeAudio(audioBlob);
      const text = response.data.text;
      
      setFormData(prev => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]}\n${text}` : text
      }));
      toast.success('Transcription successful!');
    } catch (error) {
      handleAPIError(error);
    } finally {
      setIsTranscribing(false);
      setActiveField(null);
    }
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(v => v.trim() !== '').length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required!');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await cvAPI.generateCV(formData);
      
      // Create a URL for the downloaded PDF blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.name.replace(/ /g, '_')}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Resume generated and downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate CV. Make sure the backend is running.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-accent/10 p-3 rounded-full text-accent">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Voice CV Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Fill in manually or use your voice to let our AI build your professional resume.
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span>Profile Completion</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-accent h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Form Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:p-8 border border-gray-200 dark:border-gray-700 space-y-6">
          
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-field w-full"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input-field w-full"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {/* Experience Area with Voice */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                <button
                  type="button"
                  onClick={() => isRecording && activeField === 'experience' ? stopRecording() : startRecording('experience')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isRecording && activeField === 'experience' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                  }`}
                  disabled={isTranscribing || (isRecording && activeField !== 'experience')}
                >
                  {isRecording && activeField === 'experience' ? (
                    <><MicOff className="h-4 w-4" /> <span>Stop Recording</span></>
                  ) : (
                    <><Mic className="h-4 w-4" /> <span>Speak Experience</span></>
                  )}
                </button>
              </div>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="input-field w-full p-3 resize-y"
                placeholder="Talk about your past roles or type them out..."
                disabled={isTranscribing && activeField === 'experience'}
              />
              {isTranscribing && activeField === 'experience' && (
                <div className="text-sm text-accent mt-2 flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" /> Processing audio...
                </div>
              )}
            </div>

            {/* Education Area with Voice */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
                <button
                  type="button"
                  onClick={() => isRecording && activeField === 'education' ? stopRecording() : startRecording('education')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isRecording && activeField === 'education' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                  }`}
                  disabled={isTranscribing || (isRecording && activeField !== 'education')}
                >
                  {isRecording && activeField === 'education' ? (
                    <><MicOff className="h-4 w-4" /> <span>Stop Recording</span></>
                  ) : (
                    <><Mic className="h-4 w-4" /> <span>Speak Education</span></>
                  )}
                </button>
              </div>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                rows={3}
                className="input-field w-full p-3 resize-y"
                placeholder="Mention your degrees and universities..."
                disabled={isTranscribing && activeField === 'education'}
              />
              {isTranscribing && activeField === 'education' && (
                <div className="text-sm text-accent mt-2 flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" /> Processing audio...
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="e.g. Python, React, Team Leadership (comma separated)"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isGenerating || isRecording || isTranscribing}
              className="btn-primary flex items-center px-6 py-3 text-base"
            >
              {isGenerating ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Generating magic...</>
              ) : (
                <><Download className="-ml-1 mr-2 h-5 w-5" /> Generate Resume (PDF)</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CVGenerator;
