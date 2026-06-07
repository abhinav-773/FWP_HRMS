import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Play, CheckCircle2, AlertCircle } from 'lucide-react';

const AIInterviewLanding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [micPermission, setMicPermission] = useState('prompt');

  useEffect(() => {
    // Check mic permission on load if possible
    navigator.permissions.query({ name: 'microphone' }).then((result) => {
      setMicPermission(result.state);
      result.onchange = () => {
        setMicPermission(result.state);
      };
    }).catch(() => {
       // Ignore if not supported
    });
  }, []);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setMicPermission('denied');
    }
  };

  const startInterview = () => {
    navigate(`/ai-interview/${id}/session`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="h-8 w-8 text-indigo-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">AI Voice Interview</h1>
          <p className="text-gray-400 mb-8">
            You are about to begin your automated screening interview. 
            The AI will ask you a series of questions, and you will answer them using your microphone.
          </p>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Find a quiet place</h3>
                <p className="text-sm text-gray-400">Ensure you have no background noise for the best transcription quality.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
               {micPermission === 'granted' ? (
                 <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
               ) : (
                 <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
               )}
              <div>
                <h3 className="text-white font-medium">Microphone Access</h3>
                <p className="text-sm text-gray-400">
                  {micPermission === 'granted' 
                    ? "Microphone access granted." 
                    : "We need access to your microphone to record your answers."}
                </p>
                {micPermission !== 'granted' && (
                  <button 
                    onClick={requestMicPermission}
                    className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Grant Access
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={startInterview}
            disabled={micPermission !== 'granted'}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
              micPermission === 'granted' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/25' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>Begin Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewLanding;
