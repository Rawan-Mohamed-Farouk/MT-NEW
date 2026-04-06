import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, FileText, Download, Loader2, PlayCircle, StopCircle, Speech } from 'lucide-react';
import { cvAPI, handleAPIError } from '../api/api';
import toast from 'react-hot-toast';

const INTERVIEW_STEPS = [
  { id: 'name', prompt: "Welcome! Let's build your CV. Please tell me your full name." },
  { id: 'phone', prompt: "Great. Now, what is your mobile phone number?" },
  { id: 'email', prompt: "What is your email address?" },
  { id: 'title', prompt: "What is your professional job title?" },
  { id: 'skills', prompt: "What are your core skills? Please list them." },
  { id: 'education', prompt: "Tell me about your educational background." },
  { id: 'experience', prompt: "Finally, tell me about your past work experience." }
];

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

  // Manual transcription states
  const [isRecording, setIsRecording] = useState(false);
  const [activeField, setActiveField] = useState(null); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Interview Mode states
  const [interviewMode, setInterviewMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [interviewStatus, setInterviewStatus] = useState('');
  const recognitionRef = useRef(null);

  // Audio recording refs (for manual fallback)
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // INTERVIEW MODE LOGIC (Web Speech API)
  // ==========================================
  const startInterview = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support the Voice Interview mode. Please use Google Chrome.");
      return;
    }
    setInterviewMode(true);
    setCurrentStepIndex(0);
  };

  const stopInterview = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setInterviewMode(false);
    setCurrentStepIndex(-1);
    setInterviewStatus('');
    toast('Interview stopped.', { icon: '🛑' });
  };

  // Auto-start interview on page load
  useEffect(() => {
    // Add a slight delay to ensure smooth page transition before AI starts speaking
    const timer = setTimeout(() => {
      if (!interviewMode && currentStepIndex === -1) {
        startInterview();
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (interviewMode && currentStepIndex >= 0 && currentStepIndex < INTERVIEW_STEPS.length) {
      processInterviewStep(INTERVIEW_STEPS[currentStepIndex]);
    } else if (interviewMode && currentStepIndex >= INTERVIEW_STEPS.length) {
      // Finished all steps
      setInterviewMode(false);
      setCurrentStepIndex(-1);
      setInterviewStatus('');
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("All done! Please review your details and click generate."));
      toast.success("Interview complete! Review your details.");
    }
    
    // Cleanup on unmount or interview mode end
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
         try { recognitionRef.current.stop(); } catch(e) {}
      }
    }
  }, [interviewMode, currentStepIndex]);

  const processInterviewStep = (step) => {
    setInterviewStatus(`AI speaking: Asking for ${step.id}...`);
    const synth = window.speechSynthesis;
    synth.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(step.prompt);
    
    // Fix: Wait for voices to load or grab a preferred voice right away
    const setVoiceAndSpeak = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        // Try finding a premium/natural English voice
        utterance.voice = voices.find(v => v.name.includes('Google US English')) 
                       || voices.find(v => v.lang === 'en-US') 
                       || voices[0];
      }
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Fix: Chrome Garbage Collection bug drops utterance before it speaks
      window.currentUtterance = utterance;

      utterance.onend = () => {
        startListeningForStep(step);
      };
      
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        // If autoplay blocked the voice, show a toast so the user knows they need to interact
        if (e.error === 'not-allowed') {
          toast.error("Browser blocked auto-voice! Please click ANYWHERE on the page or 'Start Interview'.");
        }
        startListeningForStep(step);
      };

      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => setVoiceAndSpeak();
      // fallback in case onvoiceschanged doesn't fire
      setTimeout(setVoiceAndSpeak, 500);
    } else {
      setVoiceAndSpeak();
    }
  };

  const startListeningForStep = (step) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US';
    recognition.continuous = false; // Auto-detects silence and stops
    recognition.interimResults = false;

    recognition.onstart = () => {
      setInterviewStatus(`Listening for your ${step.id}...`);
    };

    let hasResult = false;
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      hasResult = true;
      setFormData(prev => {
        // Append text if there's already some content, else just set it
        const currentVal = prev[step.id];
        const separator = (step.id === 'experience' || step.id === 'education') ? '\n' : ' ';
        return {
          ...prev,
          [step.id]: currentVal ? `${currentVal}${separator}${text}` : text
        };
      });
    };

    recognition.onend = () => {
      // Automatically proceed to next step
      // Little delay so it doesn't instantly snap
      setTimeout(() => {
        if (interviewMode) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }, 500);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
         // User didn't say anything, just move on smoothly
         if (interviewMode) {
           setCurrentStepIndex(prev => prev + 1);
         }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
    }
  };


  // ==========================================
  // MANUAL AUDIO RECORDING LOGIC (Groq API)
  // ==========================================
  const startRecordingManual = async (field) => {
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
        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleManualTranscription(audioBlob, field);
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

  const stopRecordingManual = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleManualTranscription = async (audioBlob, field) => {
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


  // ==========================================
  // UI HELPERS
  // ==========================================
  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(v => typeof v === 'string' && v.trim() !== '').length;
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
        
        {/* Header & Interview Mode Controls */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-accent/10 p-3 rounded-full text-accent">
                <Speech className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI Voice CV Generator
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Start the conversational interview, or fill it out manually below.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {interviewMode ? (
                <button
                  onClick={stopInterview}
                  className="bg-red-500 hover:bg-red-600 text-white flex items-center px-5 py-2.5 rounded-lg shadow-lg font-semibold transition-all hover:scale-105 active:scale-95 animate-pulse"
                >
                  <StopCircle className="w-5 h-5 mr-2" /> Stop Interview
                </button>
              ) : (
                <button
                  onClick={startInterview}
                  className="bg-gradient-to-r from-accent to-accent-dark hover:from-primary-600 hover:to-accent text-white flex items-center px-5 py-2.5 rounded-lg shadow-lg font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  <PlayCircle className="w-5 h-5 mr-2" /> Start Interview
                </button>
              )}
            </div>
          </div>
          
          {/* Active Interview Status Banner */}
          {interviewMode && (
             <div className="mb-4 bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                   <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mr-3"></div>
                   <span className="font-medium text-lg">{interviewStatus}</span>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300 font-medium bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
                  Step {currentStepIndex + 1} of {INTERVIEW_STEPS.length}
                </div>
             </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span>Profile Completion</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-accent h-2.5 rounded-full transition-all duration-500 ease-out relative" 
                style={{ width: `${calculateProgress()}%` }}
              >
                <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:p-8 border border-gray-200 dark:border-gray-700 space-y-6">
          
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {['name', 'title', 'email', 'phone'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {field === 'name' ? 'Full Name *' : field === 'email' ? 'Email *' : field}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required={field === 'name' || field === 'email'}
                    className={`input-field w-full transition-all duration-300 ${interviewMode && INTERVIEW_STEPS[currentStepIndex]?.id === field ? 'ring-2 ring-accent border-transparent bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    placeholder={`Enter your ${field}`}
                  />
                </div>
             ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {/* Experience Area with Voice */}
            <div className={`mb-6 rounded-lg transition-all duration-300 ${interviewMode && INTERVIEW_STEPS[currentStepIndex]?.id === 'experience' ? 'ring-2 ring-accent p-2 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                <button
                  type="button"
                  onClick={() => isRecording && activeField === 'experience' ? stopRecordingManual() : startRecordingManual('experience')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isRecording && activeField === 'experience' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  disabled={isTranscribing || (isRecording && activeField !== 'experience') || interviewMode}
                >
                  {isRecording && activeField === 'experience' ? (
                    <><MicOff className="h-4 w-4" /> <span>Stop Manual Record</span></>
                  ) : (
                    <><Mic className="h-4 w-4" /> <span>Manual Record</span></>
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
                disabled={(isTranscribing && activeField === 'experience')}
              />
            </div>

            {/* Education Area with Voice */}
            <div className={`mb-6 rounded-lg transition-all duration-300 ${interviewMode && INTERVIEW_STEPS[currentStepIndex]?.id === 'education' ? 'ring-2 ring-accent p-2 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
                <button
                  type="button"
                  onClick={() => isRecording && activeField === 'education' ? stopRecordingManual() : startRecordingManual('education')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isRecording && activeField === 'education' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  disabled={isTranscribing || (isRecording && activeField !== 'education') || interviewMode}
                >
                  {isRecording && activeField === 'education' ? (
                    <><MicOff className="h-4 w-4" /> <span>Stop Manual Record</span></>
                  ) : (
                    <><Mic className="h-4 w-4" /> <span>Manual Record</span></>
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
                disabled={(isTranscribing && activeField === 'education')}
              />
            </div>

            {/* Skills */}
            <div className={`mb-6 rounded-lg transition-all duration-300 ${interviewMode && INTERVIEW_STEPS[currentStepIndex]?.id === 'skills' ? 'ring-2 ring-accent p-2 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
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
              disabled={isGenerating || isRecording || isTranscribing || interviewMode}
              className="btn-primary flex items-center px-6 py-3 text-base shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
            >
              {isGenerating ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Designing your CV...</>
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
