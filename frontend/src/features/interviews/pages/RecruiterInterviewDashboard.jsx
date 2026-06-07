import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Activity, Target, MessageSquare, BrainCircuit, User } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';

// A simple Radar Chart component using SVG for standard visualization
const RadarChart = ({ scores }) => {
  const center = 100;
  const radius = 80;
  const metrics = [
    { label: 'Confidence', value: scores.confidenceScore, angle: -Math.PI / 2 },
    { label: 'Communication', value: scores.communicationScore, angle: -Math.PI / 2 + (2 * Math.PI) / 3 },
    { label: 'Technical', value: scores.technicalScore, angle: -Math.PI / 2 + (4 * Math.PI) / 3 }
  ];

  const points = metrics.map(m => {
    const r = (m.value / 100) * radius;
    return `${center + r * Math.cos(m.angle)},${center + r * Math.sin(m.angle)}`;
  }).join(' ');

  const gridPoints = [0.2, 0.4, 0.6, 0.8, 1.0].map(scale => {
    return metrics.map(m => {
      const r = scale * radius;
      return `${center + r * Math.cos(m.angle)},${center + r * Math.sin(m.angle)}`;
    }).join(' ');
  });

  return (
    <svg width="200" height="200" className="mx-auto overflow-visible">
      {/* Grid */}
      {gridPoints.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      
      {/* Axes */}
      {metrics.map((m, i) => (
        <line 
          key={i} 
          x1={center} 
          y1={center} 
          x2={center + radius * Math.cos(m.angle)} 
          y2={center + radius * Math.sin(m.angle)} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="1" 
        />
      ))}
      
      {/* Data Polygon */}
      <polygon points={points} fill="rgba(99, 102, 241, 0.4)" stroke="rgb(99, 102, 241)" strokeWidth="2" />
      
      {/* Labels */}
      {metrics.map((m, i) => (
        <text 
          key={i}
          x={center + (radius + 20) * Math.cos(m.angle)}
          y={center + (radius + 20) * Math.sin(m.angle)}
          fill="#9CA3AF"
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {m.label} ({m.value})
        </text>
      ))}
    </svg>
  );
};

const RecruiterInterviewDashboard = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock Analysis Data for now, since AI logic will run async
  const mockAnalysis = {
    confidenceScore: 85,
    communicationScore: 92,
    technicalScore: 78,
    fillerWordsCount: 12,
    speakingPace: 'Appropriate',
    sentiment: 'Highly Enthusiastic',
    strengths: ['Clear articulation', 'Structured answers', 'Strong problem-solving framework'],
    weaknesses: ['Rambled on second technical question', 'Used "um" frequently when thinking'],
    overallRecommendation: 'Strong Hire. The candidate demonstrated excellent communication skills and a solid grasp of core concepts. Minor hesitations on edge cases do not detract from overall strong performance.',
    transcript: [
      { speaker: 'AI', text: 'Hello, could you please introduce yourself and your background?', time: '00:00' },
      { speaker: 'Candidate', text: 'Hi, I am a software engineer with 3 years of experience primarily in React and Node.js. I recently built a microservices architecture for an e-commerce client.', time: '00:05' },
      { speaker: 'AI', text: 'That sounds impressive. Can you describe the biggest challenge you faced during that project?', time: '00:30' }
    ]
  };

  useEffect(() => {
    // In a real scenario, fetch interview and analysis from backend
    setTimeout(() => {
      setInterview({
        candidateName: 'Abhinav Bharadwaj',
        role: 'Senior Frontend Developer',
        analysis: mockAnalysis
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400 animate-pulse">Loading AI Analysis...</div>;
  }

  const { analysis } = interview;
  const avgScore = Math.round((analysis.confidenceScore + analysis.communicationScore + analysis.technicalScore) / 3);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/ats" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              {interview.candidateName} <span className="mx-2 text-gray-600">/</span> <span className="text-indigo-400">{interview.role}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center">
              <BrainCircuit className="w-4 h-4 mr-1 text-purple-400" />
              AI Interview Analysis Complete
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-gray-800/50 p-2 rounded-xl border border-white/5">
          <div className="text-right mr-2">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Overall Score</div>
            <div className="text-2xl font-bold text-white leading-none">{avgScore}%</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-indigo-500/10">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metrics & Radar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-400" />
              Behavioral Radar
            </h3>
            <div className="flex justify-center mb-4">
              <RadarChart scores={analysis} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-800/50 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pace</p>
                <p className="text-sm font-semibold text-white">{analysis.speakingPace}</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Filler Words</p>
                <p className="text-sm font-semibold text-white">{analysis.fillerWordsCount} detected</p>
              </div>
              <div className="col-span-2 bg-gray-800/50 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Sentiment</p>
                <p className="text-sm font-semibold text-white">{analysis.sentiment}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">AI Recommendation</h3>
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-200 text-sm leading-relaxed font-medium">
              "{analysis.overallRecommendation}"
            </div>
          </div>
        </div>

        {/* Right Column: Strengths, Weaknesses, Transcript */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Strengths
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Areas to Improve
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start">
                    <X className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Transcript Viewer */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" />
                Interview Transcript
              </h3>
              <button className="flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg">
                <Play className="w-4 h-4" />
                <span>Play Recording</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {analysis.transcript.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.speaker === 'AI' ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500">{msg.speaker}</span>
                    <span className="text-xs text-gray-600">{msg.time}</span>
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] ${
                    msg.speaker === 'AI' 
                      ? 'bg-gray-800 text-gray-300 rounded-tl-sm' 
                      : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/20'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecruiterInterviewDashboard;
