import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Activity, AlertCircle, Calendar, Clock, User, Briefcase, Globe, Info, Video, CheckCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import { io } from 'socket.io-client';
import axiosClient from '../../../services/axiosClient';

const CandidateInterviewRoom = () => {
  const { meetingUrl } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // Prep screen vs Active interview screen
  const [hasStarted, setHasStarted] = useState(false);

  // Media states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiText, setAiText] = useState('');

  // Fetch interview details using meetingUrl
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axiosClient.get(`/interviews/public/${meetingUrl}`);
        setInterview(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Interview not found or expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [meetingUrl]);

  // Connect to WebSocket only for AI Interview after user clicks Start
  useEffect(() => {
    if (!interview || interview.interviewType !== 'AI' || !hasStarted) return;
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const SOCKET_URL = API_URL.replace('/api/v1', '');
    
    const newSocket = io(SOCKET_URL, {
      query: { meetingUrl }
    });

    newSocket.on('connect', () => {
      console.log('[Frontend] Socket connected successfully:', newSocket.id);
      newSocket.emit('join_interview_room', meetingUrl);
    });

    newSocket.on('interview_ready', (data) => {
      console.log('[Frontend] interview_ready received:', data);
      startMediaRecording(newSocket);
    });

    newSocket.on('ai_question_audio', (data) => {
      setAiText(data.text);
      setAiSpeaking(true);
      setTimeout(() => {
        setAiSpeaking(false);
      }, 5000);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(newSocket);

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      newSocket.disconnect();
    };
  }, [interview, hasStarted, meetingUrl]);

  const startMediaRecording = (activeSocket) => {
    if (!webcamRef.current || !webcamRef.current.stream) {
      setTimeout(() => startMediaRecording(activeSocket), 1000);
      return;
    }
    
    try {
      const stream = webcamRef.current.stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0 && activeSocket.connected) {
          activeSocket.emit('interview_media_chunk', {
            interviewId: interview.id,
            chunk: event.data
          });
        }
      };

      mediaRecorder.start(1000); // chunk every 1 second
      setIsRecording(true);
    } catch (e) {
      console.error('Error starting MediaRecorder', e);
    }
  };

  const handleRequestNextQuestion = () => {
    console.log('[Frontend] Button clicked!');
    if (!socket) {
      console.error('[Frontend] Socket is null');
      return;
    }
    if (!socket.connected) {
      console.error('[Frontend] Socket is disconnected');
      return;
    }
    socket.emit('request_next_question', { interviewId: interview.id });
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading Interview Environment...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">{error || 'This interview link is invalid or expired.'}</p>
          <a href="/" className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const isF2F = interview.interviewType === 'FACE_TO_FACE';
  const jobTitle = interview.application?.job?.title || 'Job Opening';
  const candidateName = interview.application?.candidate?.fullName || 'Candidate';
  const formattedDate = new Date(interview.scheduledAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });

  // ----------------------------------------------------
  // RENDER: Face-to-Face Unified Candidate Dashboard
  // ----------------------------------------------------
  if (isF2F) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">HR</div>
            <span className="font-semibold text-gray-200">HireMind Candidate Portal</span>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-medium">
            Face-to-Face Interview
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
          <div className="bg-gray-900/60 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Background Light */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col space-y-8">
              {/* Job Title and Candidate Name */}
              <div className="border-b border-white/10 pb-6">
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Scheduled Interview Session</span>
                <h1 className="text-3xl font-extrabold text-white mt-1">{jobTitle}</h1>
                <p className="text-gray-400 mt-2">Prepared for: <span className="text-white font-medium">{candidateName}</span></p>
              </div>

              {/* Schedule Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800/40 p-6 rounded-2xl border border-white/5">
                <div className="flex items-start space-x-3.5">
                  <Calendar className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Date & Time</p>
                    <p className="text-sm font-semibold mt-0.5">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <Clock className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Duration</p>
                    <p className="text-sm font-semibold mt-0.5">{interview.durationMins} Minutes</p>
                  </div>
                </div>

                {interview.interviewerName && (
                  <div className="flex items-start space-x-3.5">
                    <User className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Interviewer</p>
                      <p className="text-sm font-semibold mt-0.5">{interview.interviewerName}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3.5">
                  <Globe className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Platform Provider</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">
                      {interview.meetingProvider === 'GOOGLE_MEET' ? 'Google Meet' :
                       interview.meetingProvider === 'ZOOM' ? 'Zoom' :
                       interview.meetingProvider === 'MS_TEAMS' ? 'Microsoft Teams' : 'Web Video'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scheduled Rounds */}
              {interview.interviewRounds && interview.interviewRounds.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Rounds in this session</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {interview.interviewRounds.map((round, index) => (
                      <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                        {round}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruiter Notes */}
              {interview.interviewNotes && (
                <div className="bg-gray-800/20 border border-white/5 p-5 rounded-2xl">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-indigo-400" /> Instructions from Recruiter
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-sans">
                    {interview.interviewNotes}
                  </p>
                </div>
              )}

              {/* CTA Join Button */}
              {interview.location ? (
                <div className="pt-4">
                  <a
                    href={interview.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all text-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Join Face-to-Face Meeting
                  </a>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Clicking will open the {interview.meetingProvider === 'ZOOM' ? 'Zoom' : 'Google Meet'} room in a new browser tab.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center">
                  Meeting URL was not provided by the interviewer. Please contact the recruitment team.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-14 border-t border-white/5 flex items-center justify-center text-xs text-gray-500 bg-gray-900/10">
          Powered by HireMind AI Lifecycle Automation
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: AI Interview Prep Screen
  // ----------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">HR</div>
            <span className="font-semibold text-gray-200">HireMind AI Interview Portal</span>
          </div>
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-medium">
            AI Voice Interview Room
          </span>
        </header>

        {/* Prep Content Grid */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
          {/* Left: Device & Camera Check */}
          <div className="space-y-4">
            <div className="aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl relative">
              <Webcam
                audio={true}
                ref={webcamRef}
                muted={true}
                videoConstraints={{ facingMode: "user" }}
                className={`w-full h-full object-cover transition-opacity duration-300 ${!isCamOn ? 'opacity-0' : 'opacity-100'}`}
              />
              {!isCamOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-500">
                    {candidateName.charAt(0)}
                  </div>
                </div>
              )}
              {/* Media Status Badges */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-sm p-3 rounded-2xl border border-white/5 text-xs">
                <span className="flex items-center text-green-400 font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                  Camera Preview Active
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsMicOn(!isMicOn);
                      if (webcamRef.current && webcamRef.current.stream) {
                        webcamRef.current.stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
                      }
                    }}
                    className={`p-2 rounded-xl transition-colors ${isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsCamOn(!isCamOn)}
                    className={`p-2 rounded-xl transition-colors ${isCamOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                  >
                    {isCamOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Please adjust your lighting and ensure your webcam is centered at eye level.
            </p>
          </div>

          {/* Right: Prep Details & Checklist */}
          <div className="bg-gray-900/60 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col space-y-6">
              <div>
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">AI Voice Evaluation Session</span>
                <h1 className="text-2xl font-extrabold text-white mt-1">{jobTitle}</h1>
                <p className="text-gray-400 mt-1.5">Candidate: <span className="text-white font-medium">{candidateName}</span></p>
              </div>

              {/* Specs */}
              <div className="flex gap-4 text-xs font-semibold text-gray-300">
                <span className="bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {interview.durationMins} Min Session
                </span>
                <span className="bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {formattedDate}
                </span>
              </div>

              {/* Prep Checklist */}
              <div className="border-t border-b border-white/10 py-5 space-y-3.5 text-xs text-gray-400">
                <h3 className="font-bold text-gray-200">Before you click Start:</h3>
                <div className="flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold">1</div>
                  <p>Find a quiet, distraction-free environment with minimal background noise.</p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold">2</div>
                  <p>Check that your microphone and headset are working and clear.</p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold">3</div>
                  <p>Our AI will prompt you with behavioral and technical questions, listening carefully to your answers. Speak clearly and concisely.</p>
                </div>
              </div>

              {/* Start CTA */}
              <button
                onClick={() => setHasStarted(true)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 text-center hover:-translate-y-0.5 active:translate-y-0"
              >
                Start AI Voice Interview
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-14 border-t border-white/5 flex items-center justify-center text-xs text-gray-500 bg-gray-900/10">
          Powered by HireMind AI Automation Engine
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: Active AI voice Interview Room
  // ----------------------------------------------------
  return (
    <div className="h-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      {/* Top Navigation */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold">HR</div>
          <span className="font-semibold text-gray-200">AI Interview</span>
          {isRecording && (
            <span className="ml-4 flex items-center text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
              Recording
            </span>
          )}
        </div>
        <div className="text-sm font-medium text-gray-400">
          Role: <span className="text-white">{jobTitle}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex p-4 gap-4 h-[calc(100vh-4rem)]">
        {/* Left Side: Candidate Video */}
        <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
          <Webcam
            audio={true}
            ref={webcamRef}
            muted={true}
            videoConstraints={{ facingMode: "user" }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${!isCamOn ? 'opacity-0' : 'opacity-100'}`}
          />
          {!isCamOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-bold text-gray-500">
                {candidateName.charAt(0)}
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl">
            <button
              onClick={() => {
                setIsMicOn(!isMicOn);
                if (webcamRef.current && webcamRef.current.stream) {
                  webcamRef.current.stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
                }
              }}
              className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsCamOn(!isCamOn)}
              className={`p-3 rounded-full transition-colors ${isCamOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
            >
              {isCamOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => {
                if (socket) socket.disconnect();
                window.location.href = '/';
              }}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors ml-4 shadow-lg shadow-red-500/20"
              title="End Interview"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: AI Interviewer */}
        <div className="w-96 flex flex-col gap-4">
          <div className="flex-1 bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Ambient background glow when speaking */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${aiSpeaking ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-6 transition-all duration-300 ${aiSpeaking ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.4)]' : 'border-gray-700 bg-gray-800'}`}>
                <Activity className={`w-12 h-12 ${aiSpeaking ? 'text-indigo-400 animate-pulse' : 'text-gray-500'}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Interviewer</h3>
              <p className="text-sm text-gray-400">
                {aiSpeaking ? 'Speaking...' : 'Listening...'}
              </p>
            </div>
            
            <button 
              onClick={handleRequestNextQuestion}
              className="relative z-10 mt-8 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start / Next Question
            </button>
          </div>

          {/* AI Transcripts / Subtitles Box */}
          <div className="h-48 bg-gray-900 border border-white/10 rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-2xl">
             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex justify-between">
               <span>Live Caption</span>
               {aiSpeaking && <span className="text-indigo-400 animate-pulse">Typing...</span>}
             </h4>
             <div className="flex-1 overflow-y-auto">
               <p className="text-lg text-gray-300 leading-relaxed font-medium">
                 {aiText || "Hello! I am your AI Interviewer today. Please click 'Start / Next Question' to begin."}
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviewRoom;
