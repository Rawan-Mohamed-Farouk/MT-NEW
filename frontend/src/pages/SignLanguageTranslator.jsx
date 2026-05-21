import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/api'; // Use central api instance
import { 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  History, 
  Info, 
  AlertCircle
} from 'lucide-react';

const SignLanguageTranslator = () => {
  // Script loading and initialization state
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [scriptsError, setScriptsError] = useState(false);
  
  // Camera & Tracking state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // prompt, granted, denied
  const [isModelLoading, setIsModelLoading] = useState(false);
  
  // Real-time Prediction state
  const [prediction, setPrediction] = useState({ gesture: null, confidence: 0 });
  const [noHandCount, setNoHandCount] = useState(0);
  
  // Translation History & Settings
  const [translationHistory, setTranslationHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastConfirmedGesture, setLastConfirmedGesture] = useState(null);
  
  // DOM References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const activeStreamRef = useRef(null);
  const handsInstanceRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  
  // Performance and throttling references
  const lastPredictionTime = useRef(0);
  const gestureStreak = useRef({ gesture: null, count: 0 });

  // 2. Dynamically load MediaPipe CDN Scripts
  useEffect(() => {
    let mounted = true;
    
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    };

    const loadAllScripts = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        
        if (mounted) {
          setScriptsLoaded(true);
          console.log("MediaPipe scripts loaded successfully.");
        }
      } catch (err) {
        console.error("Failed to load MediaPipe CDN scripts:", err);
        if (mounted) {
          setScriptsError(true);
          toast.error("Failed to load hand tracking system. Please refresh the page.");
        }
      }
    };

    loadAllScripts();

    return () => {
      mounted = false;
    };
  }, []);

  // 3. Keep track of hand absence to clear current prediction
  useEffect(() => {
    if (noHandCount > 8) {
      setPrediction({ gesture: null, confidence: 0 });
      gestureStreak.current = { gesture: null, count: 0 };
    }
  }, [noHandCount]);

  // 4. Text-To-Speech function
  const speakGesture = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // 5. Send flat landmarks array to local backend prediction endpoint
  const sendPredictionToBackend = async (landmarksArray) => {
    const now = Date.now();
    if (now - lastPredictionTime.current < 180) return;
    lastPredictionTime.current = now;

    try {
      const response = await api.post(`/sign-language/predict`, {
        landmarks: landmarksArray
      });

      const { gesture, confidence } = response.data;
      setPrediction({ gesture, confidence });
      setNoHandCount(0);

      if (confidence > 0.60) {
        if (gestureStreak.current.gesture === gesture) {
          gestureStreak.current.count += 1;
        } else {
          gestureStreak.current.gesture = gesture;
          gestureStreak.current.count = 1;
        }

        if (gestureStreak.current.count === 3) {
          if (gesture !== lastConfirmedGesture) {
            setLastConfirmedGesture(gesture);
            speakGesture(gesture);
            if (gesture === 'stop') {
              setTranslationHistory(prev => [...prev, ' ']);
            } else {
              setTranslationHistory(prev => [...prev, gesture]);
            }
          }
          gestureStreak.current.count = 0;
        }
      }
    } catch (err) {
      console.error("Backend prediction error:", err);
    }
  };

  // 6. MediaPipe hands callback function
  const onHandsResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const handLandmarks = results.multiHandLandmarks[0];

      if (window.drawConnectors) {
        window.drawConnectors(canvasCtx, handLandmarks, window.HAND_CONNECTIONS, {
          color: '#10B981',
          lineWidth: 4
        });
      }

      if (window.drawLandmarks) {
        window.drawLandmarks(canvasCtx, handLandmarks, {
          color: '#FFFFFF',
          fillColor: '#3B82F6',
          lineWidth: 1.5,
          radius: 5
        });
      }

      const landmarksFlat = [];
      for (const lm of handLandmarks) {
        landmarksFlat.push(lm.x, lm.y, lm.z);
      }

      // Always try to send prediction to backend
      sendPredictionToBackend(landmarksFlat);
    } else {
      setNoHandCount(prev => prev + 1);
    }
  };

  // 7. Initialize and start tracking
  const startCamera = async () => {
    if (!scriptsLoaded) return;

    setIsModelLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      
      activeStreamRef.current = stream;
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          initializeMediaPipe();
        };
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraPermission('denied');
      setIsModelLoading(false);
      toast.error("Camera permission denied. Please grant camera access in settings.");
    }
  };

  // 8. Setup MediaPipe Hands and Camera instances
  const initializeMediaPipe = () => {
    if (!window.Hands || !window.Camera) {
      console.error("MediaPipe classes not loaded on window.");
      setIsModelLoading(false);
      return;
    }

    try {
      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      hands.onResults(onHandsResults);
      handsInstanceRef.current = hands;

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      camera.start()
        .then(() => {
          cameraInstanceRef.current = camera;
          setIsCameraActive(true);
          setIsModelLoading(false);
          toast.success("Real-time sign language visualizer started!");
        })
        .catch(err => {
          console.error("MediaPipe camera start error:", err);
          setIsModelLoading(false);
          toast.error("Failed to start hand tracker tracking loop.");
        });
    } catch (err) {
      console.error("Error initializing MediaPipe:", err);
      setIsModelLoading(false);
    }
  };

  // 9. Stop camera and release resources
  const stopCamera = () => {
    if (cameraInstanceRef.current) {
      try { cameraInstanceRef.current.stop(); } catch (e) { console.error(e); }
      cameraInstanceRef.current = null;
    }
    if (handsInstanceRef.current) {
      try { handsInstanceRef.current.close(); } catch (e) { console.error(e); }
      handsInstanceRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setPrediction({ gesture: null, confidence: 0 });
    gestureStreak.current = { gesture: null, count: 0 };
    setLastConfirmedGesture(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const clearHistory = () => {
    setTranslationHistory([]);
    setLastConfirmedGesture(null);
    toast.success("Translation history cleared.");
  };

  const copyToClipboard = () => {
    const textToCopy = translationHistory.join(' ');
    if (!textToCopy.trim()) {
      toast.error("Nothing to copy!");
      return;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copied translations to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatGestureLabel = (gestureName) => {
    if (!gestureName) return '';
    return gestureName.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded-full animate-pulse">
                Native App Integrated
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Sign Language Translator
              </h1>
            </div>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Interactive, AI-powered real-time American Sign Language (ASL) gesture recognition system.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-600 dark:text-gray-400 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all"
              title={isMuted ? "Unmute TTS Voice" : "Mute TTS Voice"}
            >
              {isMuted ? <VolumeX className="h-5 w-5 text-rose-500" /> : <Volume2 className="h-5 w-5 text-emerald-500" />}
            </button>
          </div>
        </div>

        {scriptsError && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-200 shadow-md">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-base">Network Script Loading Error</h4>
              <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                Failed to pull MediaPipe tracking libraries from CDN. Please check your internet connection and refresh the page to reload assets.
              </p>
            </div>
          </div>
        )}

        {/* Main Full-width Layout (Removed Dictionary sidebar) */}
        <div className="flex flex-col gap-6">
          
          {/* Visualizer Frame */}
          <div className="relative aspect-video w-full max-h-[600px] bg-gray-950 dark:bg-black rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col items-center justify-center">
            
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transform -scale-x-100"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transform -scale-x-100 z-10"
            />

            {!isCameraActive && (
              <div className="z-20 flex flex-col items-center justify-center p-8 text-center bg-gray-950/90 dark:bg-black/90 absolute inset-0 transition-opacity">
                <div className="relative mb-6 p-5 bg-gray-900 dark:bg-gray-800 rounded-full border border-gray-800 dark:border-gray-700 shadow-lg">
                  <CameraOff className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Camera is Powered Off</h3>
                <p className="text-gray-400 max-w-md mb-8 text-base">
                  Grant permission and start your camera feed. media processing occurs entirely client-side.
                </p>

                <button
                  onClick={startCamera}
                  disabled={isModelLoading || scriptsError || !scriptsLoaded}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold text-lg rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 disabled:scale-100 transition-all cursor-pointer"
                >
                  {isModelLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Initializing Tracking...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6" />
                      <span>Start Translating Now</span>
                    </>
                  )}
                </button>

                {!scriptsLoaded && !scriptsError && (
                  <p className="mt-4 text-xs text-blue-400 flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                    Downloading MediaPipe core models from CDN...
                  </p>
                )}
              </div>
            )}

            {isCameraActive && (
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 hover:bg-rose-600 backdrop-blur text-white text-sm font-bold rounded-xl border border-gray-800 shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <CameraOff className="h-4 w-4" />
                  Stop Camera
                </button>
              </div>
            )}

            {isCameraActive && prediction.gesture && (
              <div className="absolute bottom-4 left-4 z-20 px-3.5 py-1.5 bg-emerald-500/90 text-white font-bold text-xs rounded-full shadow-lg backdrop-blur flex items-center gap-1.5">
                <span className="h-2 w-2 bg-white rounded-full animate-ping" />
                <span>Hand Tracked Successfully</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Real-time Gesture Prediction
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                  Updates in millisecond real-time based on your hand landmarks.
                </p>
              </div>

              <div className="flex items-center justify-center py-4 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-2xl min-h-[140px] mb-4">
                {prediction.gesture ? (
                  <div className="text-center">
                    <div className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tight animate-bounce">
                      {formatGestureLabel(prediction.gesture)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Classified Gesture Name
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-600 p-4">
                    {isCameraActive ? (
                      <p className="text-sm font-medium">Place your hand in front of the camera to translate</p>
                    ) : (
                      <p className="text-sm font-medium">Turn camera on to see prediction</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
                  Confidence Accuracy Meter
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                  Calculated probabilistic certainty of the ML RandomForest classifier.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-4 mb-4">
                {prediction.gesture ? (
                  <div className="w-full px-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-gray-400">Accuracy Status</span>
                      <span className={`text-4xl font-extrabold tracking-tight ${
                        prediction.confidence > 0.85 ? 'text-emerald-500' :
                        prediction.confidence > 0.60 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ease-out ${
                          prediction.confidence > 0.85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                          prediction.confidence > 0.60 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 
                          'bg-gradient-to-r from-rose-500 to-pink-500'
                        }`}
                        style={{ width: `${prediction.confidence * 100}%` }}
                      />
                    </div>

                    <div className="mt-3 text-xs text-center font-semibold text-gray-500 dark:text-gray-400">
                      {prediction.confidence > 0.85 ? "Excellent Signal Clarity" :
                       prediction.confidence > 0.60 ? "Moderate Signal; Hold Hand Still" :
                       "Unreliable; Check Hand Alignment"}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-600">
                    <p className="text-sm font-medium">No tracking signal detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
                  Translation Tape & Transcript
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={translationHistory.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={clearHistory}
                  disabled={translationHistory.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 min-h-[100px] flex items-center justify-start flex-wrap gap-2 shadow-inner">
              {translationHistory.length > 0 ? (
                translationHistory.map((item, index) => (
                  <span 
                    key={index} 
                    className={`px-3 py-1.5 text-sm font-extrabold rounded-lg shadow-sm border ${
                      item === ' ' ? 'px-4 bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-500' : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-900'
                    }`}
                  >
                    {item === ' ' ? '␣ SPACE' : item.toUpperCase()}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 dark:text-gray-600 text-sm font-medium italic w-full text-center py-6">
                  A tape of confirmed gesture words will print here as they are spoken.
                </p>
              )}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
              <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>Tip: Hold a gesture for 3 consecutive frames (approx. 0.5s) to confirm and append it to the translator transcript.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageTranslator;

