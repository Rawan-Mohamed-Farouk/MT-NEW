import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, PlayCircle, Mic } from 'lucide-react';
import { cvAPI } from '../api/api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'name', prompt: 'Welcome to the CV Generator. Please clearly say your full name.' },
  { id: 'phone', prompt: 'Please say your mobile phone number.' },
  { id: 'email', prompt: 'What is your email address?' },
  { id: 'title', prompt: 'What is your current or desired job title?' },
  { id: 'skills', prompt: 'Please list your technical or professional skills.' },
  { id: 'education', prompt: 'Tell me about your educational background.' },
  { id: 'experience', prompt: 'Finally, tell me about your work experience.' }
];

export default function CVGenerator() {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', title: '', skills: '', education: '', experience: ''
  });
  
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [statusText, setStatusText] = useState('Click anywhere to start the AI Voice Assistant');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Mount logic: wait for first click to satisfy autoplay
  useEffect(() => {
    const handleFirstClick = () => {
      if (!isActive && currentStep === -1) {
        setIsActive(true);
        setCurrentStep(0);
        setStatusText('Starting...');
      }
    };
    
    document.addEventListener('click', handleFirstClick);
    return () => {
      document.removeEventListener('click', handleFirstClick);
      stopTracks();
    };
  }, [isActive, currentStep]);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  // Run the sequence
  useEffect(() => {
    if (isActive && currentStep >= 0 && currentStep < STEPS.length) {
      runStep(STEPS[currentStep]);
    } else if (isActive && currentStep >= STEPS.length) {
      setStatusText('All Done! Please review and click Generate.');
      setIsActive(false);
      speakText('All done! Please review your details below and click Generate Resume.');
    }
  }, [isActive, currentStep]);

  const speakText = (text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = synth.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices.find(v => v.name.includes('Google US English')) 
                       || voices.find(v => v.lang === 'en-US') 
                       || voices[0];
      }
      utterance.rate = 1.0;
      
      // Prevent GC bug
      window._currentUtterance = utterance;
      
      utterance.onend = () => { resolve(); };
      utterance.onerror = () => { resolve(); };
      
      synth.speak(utterance);
      
      // Safety timeout in case onend drops
      setTimeout(() => resolve(), text.length * 100 + 2000);
    });
  };

  const runStep = async (step) => {
    setStatusText(`AI is speaking: Asking for ${step.id}...`);
    // 1. Speak the prompt
    await speakText(step.prompt);
    
    // 2. Start recording and waiting for silence
    setStatusText(`Listening to your ${step.id}... (Speak now)`);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextCtor();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      let isRecordingEnded = false;

      mediaRecorder.onstop = async () => {
        isRecordingEnded = true;
        stopTracks();
        
        if (audioChunks.length === 0) {
           setCurrentStep(prev => prev + 1);
           return;
        }
        
        setStatusText(`Transcribing your ${step.id}...`);
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        
        try {
          const response = await cvAPI.transcribeAudio(blob);
          const transcript = response.data.text.trim();
          
          // Filter out typical Whisper hallucinations on silence
          const lower = transcript.toLowerCase();
          const isHallucination = lower.includes("thank you for") || lower.includes("subscribe") || transcript.length < 2;
          
          if (!isHallucination) {
            setFormData(prev => ({
              ...prev,
              [step.id]: prev[step.id] ? `${prev[step.id]}\n${transcript}` : transcript
            }));
          }
        } catch(err) {
          console.error("Transcription error", err);
        }
        
        // Move to next step
        setCurrentStep(prev => prev + 1);
      };

      mediaRecorder.start();

      // Silence detection logic
      let silenceStart = Date.now();
      let hasSpoken = false;

      const detectSilence = () => {
        if (isRecordingEnded || mediaRecorder.state !== 'recording') return;
        
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((val, acc) => val + acc, 0);
        const average = sum / dataArray.length;
        
        if (average > 15) { // Threshold for speech
           if (!hasSpoken) hasSpoken = true;
           silenceStart = Date.now();
        } else {
           if (hasSpoken) {
              // User SPOKE, now wait 2 seconds of silence to close
              if (Date.now() - silenceStart > 2000) {
                 mediaRecorder.stop();
                 return;
              }
           } else {
              // User HAS NOT SPOKEN, wait 6 seconds to timeout
              if (Date.now() - silenceStart > 6000) {
                 mediaRecorder.stop();
                 return;
              }
           }
        }
        requestAnimationFrame(detectSilence);
      };
      
      detectSilence();
      
    } catch(err) {
       console.error("Mic error", err);
       toast.error("Microphone access denied. Moving to next question.");
       setCurrentStep(prev => prev + 1);
    }
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
      toast.success('Resume downloaded!');
    } catch (error) {
      toast.error('Failed to generate CV.');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateProgress = () => {
    const total = 7;
    const filled = Object.values(formData).filter(v => v.trim() !== '').length;
    return Math.round((filled / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Status Overlay Clicker */}
        {!isActive && currentStep === -1 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 cursor-pointer pointer-events-auto transition-opacity"
               onClick={() => {
                 setIsActive(true);
                 setCurrentStep(0);
                 setStatusText('Starting...');
               }}>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-accent/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Mic className="h-12 w-12 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ready to Build Your CV?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Tap anywhere to start the automated AI Interview.</p>
            </div>
          </div>
        )}

        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                <Mic className="text-accent" /> AI Voice Interview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
                {statusText}
              </p>
            </div>
            {isActive && (
              <div className="flex items-center gap-3 font-semibold text-accent bg-accent/10 px-4 py-2 rounded-lg">
                <Loader2 className="animate-spin w-5 h-5" />
                Step {currentStep + 1} of {STEPS.length}
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <span>Profile Completion</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="bg-accent h-3 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${calculateProgress()}%` }}></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {['name', 'title', 'email', 'phone'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {field === 'name' ? 'Full Name' : field}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={`input-field w-full transition-all duration-300 ${isActive && STEPS[currentStep]?.id === field ? 'ring-4 ring-accent bg-blue-50/50' : 'bg-gray-50'}`}
                    placeholder={`Waiting for ${field}...`}
                  />
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            {['experience', 'education', 'skills'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {field}
                </label>
                {field === 'skills' ? (
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={`input-field w-full transition-all duration-300 ${isActive && STEPS[currentStep]?.id === field ? 'ring-4 ring-accent bg-blue-50/50' : 'bg-gray-50'}`}
                    placeholder={`Your ${field} will appear here...`}
                  />
                ) : (
                  <textarea
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    rows={4}
                    className={`input-field w-full p-4 transition-all duration-300 resize-y ${isActive && STEPS[currentStep]?.id === field ? 'ring-4 ring-accent bg-blue-50/50' : 'bg-gray-50'}`}
                    placeholder={`Your ${field} will appear here...`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isGenerating || isActive}
              className="btn-primary w-full md:w-auto text-lg px-8 py-4 shadow-xl flex justify-center items-center gap-2"
            >
              {isGenerating ? <><Loader2 className="animate-spin w-6 h-6" /> Building Resume...</> : <><Download className="w-6 h-6" /> Download Professional PDF Resume</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
