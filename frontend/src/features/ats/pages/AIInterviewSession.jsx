import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Loader2, CheckCircle, Volume2 } from 'lucide-react';
import axios from 'axios';

// AI Service URL (FastAPI)
const AI_API_URL = 'http://localhost:8000/api/v1/interview';

const AIInterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionState, setSessionState] = useState('loading'); // loading, speaking, listening, processing, completed, error
  const [errorMsg, setErrorMsg] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      setSessionState('loading');
      const res = await axios.get(`${AI_API_URL}/${id}/questions`);
      if (res.data.success && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        startQuestionFlow(res.data.questions[0]);
      } else {
        setErrorMsg("No questions found for this interview.");
        setSessionState('error');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load interview. Ensure AI service is running.");
      setSessionState('error');
    }
  };

  const startQuestionFlow = (question) => {
    setSessionState('speaking');
    
    // Check if speechSynthesis is available
    if ('speechSynthesis' in window) {
      // Small delay for UI to settle
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(question.text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Find a good voice if available
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        if (englishVoices.length > 0) {
          // Prefer a female/neutral voice if possible, fallback to first
          const preferred = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha'));
          if (preferred) utterance.voice = preferred;
        }

        utterance.onend = () => {
          startListening();
        };

        utterance.onerror = (e) => {
          console.error("Speech synthesis error", e);
          startListening(); // fallback to listening anyway
        };

        window.speechSynthesis.speak(utterance);
      }, 500);
    } else {
      // Fallback if no TTS
      startListening();
    }
  };

  const startListening = async () => {
    try {
      setSessionState('listening');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks to turn off mic light
        stream.getTracks().forEach(track => track.stop());
        await processAnswer(audioBlob);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Microphone access failed", err);
      setErrorMsg("Microphone access failed.");
      setSessionState('error');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const processAnswer = async (audioBlob) => {
    setSessionState('processing');
    const currentQ = questions[currentQuestionIndex];
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'answer.webm');
    formData.append('question_id', currentQ.id);
    formData.append('question_text', currentQ.text);
    formData.append('job_title', 'Candidate'); // We'd ideally fetch this from ATS backend

    try {
      await axios.post(`${AI_API_URL}/${id}/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Move to next question or complete
      if (currentQuestionIndex + 1 < questions.length) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        startQuestionFlow(questions[nextIndex]);
      } else {
        await finishInterview();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload answer.");
      setSessionState('error');
    }
  };

  const finishInterview = async () => {
    setSessionState('processing');
    try {
      await axios.post(`${AI_API_URL}/${id}/complete`);
      setSessionState('completed');
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to complete interview.");
      setSessionState('error');
    }
  };

  const renderContent = () => {
    if (sessionState === 'loading') {
      return (
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-4" />
          <p className="text-gray-400">Connecting to AI Server...</p>
        </div>
      );
    }

    if (sessionState === 'error') {
      return (
        <div className="text-center">
          <p className="text-red-400 mb-4">{errorMsg}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition"
          >
            Retry
          </button>
        </div>
      );
    }

    if (sessionState === 'completed') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Complete</h2>
          <p className="text-gray-400 mb-8">Thank you for your time. The recruiting team will review your responses and get back to you shortly.</p>
          <button 
            onClick={() => window.close()}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition"
          >
            Close Window
          </button>
        </div>
      );
    }

    // Active session states (speaking, listening, processing)
    const currentQ = questions[currentQuestionIndex];

    return (
      <div className="text-center w-full">
        {/* Progress bar */}
        <div className="w-full bg-gray-700 h-1.5 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          />
        </div>

        <div className="mb-12 h-24 flex items-center justify-center">
          <h2 className="text-2xl font-medium text-white max-w-2xl">
            "{currentQ?.text}"
          </h2>
        </div>

        {/* Visualizer / Avatar */}
        <div className="relative w-48 h-48 mx-auto mb-12">
          {sessionState === 'speaking' && (
            <>
               <div className="absolute inset-0 bg-indigo-500/30 rounded-full animate-ping"></div>
               <div className="absolute inset-2 bg-indigo-500/40 rounded-full animate-pulse"></div>
            </>
          )}
          {sessionState === 'listening' && (
            <>
               <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
            </>
          )}
          
          <div className="absolute inset-0 bg-gray-800 border-2 border-white/10 rounded-full flex flex-col items-center justify-center shadow-xl z-10">
            {sessionState === 'speaking' && <Volume2 className="h-12 w-12 text-indigo-400 mb-2 animate-bounce" />}
            {sessionState === 'listening' && <Mic className="h-12 w-12 text-green-400 mb-2" />}
            {sessionState === 'processing' && <Loader2 className="h-12 w-12 text-purple-400 mb-2 animate-spin" />}
            
            <span className="text-sm font-medium text-gray-300">
              {sessionState === 'speaking' && 'AI Speaking'}
              {sessionState === 'listening' && 'Recording'}
              {sessionState === 'processing' && 'Processing'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="h-16">
          {sessionState === 'listening' && (
            <button
              onClick={stopListening}
              className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center space-x-2 mx-auto"
            >
              <Square className="h-4 w-4" fill="currentColor" />
              <span>Finish Answer</span>
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-gray-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default AIInterviewSession;
