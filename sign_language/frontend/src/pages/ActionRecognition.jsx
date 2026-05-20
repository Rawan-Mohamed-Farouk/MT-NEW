import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Loader2, PlayCircle, Eye, CheckCircle2, Camera, Square, Circle, X } from 'lucide-react';
import api, { handleAPIError } from '../api/api';
import toast from 'react-hot-toast';

const ActionRecognition = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Webcam states
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const chunksRef = useRef([]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        toast.error('Please select a valid video file.');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setReport('');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode('camera');
      setFile(null);
      setPreviewUrl('');
      setReport('');
    } catch (err) {
      toast.error('Failed to access camera. Please check permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      // Create artificial File object compatible with form upload
      const recordedFile = new File([blob], `live_capture_${Date.now()}.webm`, { type: 'video/webm' });
      setFile(recordedFile);
      setPreviewUrl(URL.createObjectURL(recordedFile));
      stopCamera();
      setMode('upload');
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a video file first.');
      return;
    }

    setLoading(true);
    setReport('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/action-recognition/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setReport(response.data.report);
      toast.success('Analysis complete!');
    } catch (error) {
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => navigate('/tools')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
              <Eye className="mr-3 text-purple-600 h-8 w-8" /> 
              Action Recognition
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Upload a video to analyze activities, objects, and significant moments using AI vision.
            </p>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Upload & Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Video className="mr-2 h-5 w-5" /> Video Input
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Input Mode Toggle */}
              {!previewUrl && mode !== 'camera' && (
                <div className="flex justify-center space-x-4 mb-4">
                  <button 
                    onClick={() => setMode('upload')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'upload' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    Upload File
                  </button>
                  <button 
                    onClick={startCamera}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${mode === 'camera' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <Camera className="w-4 h-4 mr-2" /> Live Camera
                  </button>
                </div>
              )}

              {/* Upload Area / Camera Area */}
              {mode === 'camera' ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-purple-500/30">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className="max-h-full max-w-full transform scale-x-[-1]"
                    />
                    {isRecording && (
                      <div className="absolute top-4 right-4 flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        <Circle className="w-3 h-3 fill-current mr-2" /> Recording
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <button 
                      onClick={() => {
                        stopCamera();
                        setMode('upload');
                        setIsRecording(false);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 font-semibold flex items-center transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </button>
                    {!isRecording ? (
                      <button 
                        onClick={startRecording}
                        className="flex items-center text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
                      >
                        <Circle className="w-4 h-4 fill-current mr-2" /> Record
                      </button>
                    ) : (
                      <button 
                        onClick={stopRecording}
                        className="flex items-center text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
                      >
                        <Square className="w-4 h-4 fill-current mr-2" /> Stop Recording
                      </button>
                    )}
                  </div>
                </div>
              ) : !previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors relative group">
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <PlayCircle className="h-16 w-16 text-purple-500 mb-4 opacity-80" />
                  <p className="text-gray-700 dark:text-gray-200 font-medium text-lg">Click or drag a video here</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">MP4, WebM, MOV supported</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video 
                      src={previewUrl} 
                      controls 
                      className="max-h-full max-w-full"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate pr-4 font-medium">
                      {file?.name}
                    </span>
                    <button 
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl('');
                        setReport('');
                      }}
                      className="text-sm text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className={`w-full py-4 rounded-xl flex justify-center items-center font-bold text-lg transition-all ${
                  !file || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Eye className="-ml-1 mr-2 h-6 w-6" />
                    Extract Actions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full min-h-[500px]">
            <div className="bg-gray-100 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                Analysis Report
              </h2>
            </div>
            
            <div className="p-6 flex-grow overflow-auto relative bg-gray-50 dark:bg-gray-900">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                  <p className="text-lg font-medium">Processing video frame by frame...</p>
                  <p className="text-sm mt-2 opacity-80">Depending on the video length, this may take a minute.</p>
                </div>
              ) : report ? (
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {report}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="text-lg">Upload and analyze a video to see the generated intelligence report here.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ActionRecognition;
