import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Video, MapPin, CheckCircle, XCircle, Mic, Copy, Star, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../../services/axiosClient';
import { format } from 'date-fns';

const InterviewScheduler = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluatingInterview, setEvaluatingInterview] = useState(null);
  const [evaluation, setEvaluation] = useState({
    technicalScore: 0,
    problemSolvingScore: 0,
    communicationScore: 0,
    feedback: '',
    recommendation: 'HIRE'
  });

  const fetchInterviews = async () => {
    try {
      const res = await axiosClient.get('/interviews');
      setInterviews(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.put(`/interviews/${id}`, { status });
      toast.success(`Interview marked as ${status.toLowerCase()}`);
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to update interview status');
    }
  };

  const submitEvaluation = async () => {
    if (!evaluatingInterview) return;
    try {
      await axiosClient.put(`/interviews/${evaluatingInterview.id}`, { 
        status: 'COMPLETED',
        evaluation
      });
      toast.success('Evaluation submitted successfully');
      setEvaluatingInterview(null);
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to submit evaluation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Interviews</h2>
          <p className="text-gray-400 mt-1">Manage and track candidate interviews.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate & Job</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Interviewer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-base">{interview.application?.candidate?.fullName}</div>
                    <div className="text-indigo-400 font-medium text-xs mt-1">{interview.application?.job?.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{interview.application?.candidate?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-200">{format(new Date(interview.scheduledAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center mt-1 text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{format(new Date(interview.scheduledAt), 'hh:mm a')} ({interview.durationMins} mins)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {interview.type === 'VIDEO_CALL' ? <Video className="h-4 w-4 mr-2 text-blue-400" /> : 
                       interview.type === 'AI_VOICE' ? <Mic className="h-4 w-4 mr-2 text-purple-400" /> :
                       <MapPin className="h-4 w-4 mr-2 text-gray-400" />}
                      <span className="text-gray-300">{interview.type?.replace('_', ' ') || ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold mr-2">
                        {interview.interviewer?.fullName?.charAt(0) || 'I'}
                      </div>
                      <span>{interview.interviewer?.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      interview.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      interview.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      interview.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {interview.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {interview.status === 'SCHEDULED' && (
                      <div className="flex justify-end space-x-2">
                        {interview.type === 'AI_VOICE' && (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/ai-interview/${interview.id}`);
                              toast.success('Link copied to clipboard!');
                            }}
                            className="p-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-md transition-colors"
                            title="Copy Interview Link"
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        )}
                        {interview.type === 'TECHNICAL' && (
                          <button 
                            onClick={() => setEvaluatingInterview(interview)}
                            className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md transition-colors"
                            title="Evaluate Candidate"
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => updateStatus(interview.id, 'COMPLETED')}
                          className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-md transition-colors"
                          title="Mark Completed"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => updateStatus(interview.id, 'CANCELLED')}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                          title="Cancel Interview"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!isLoading && interviews.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    No interviews scheduled.
                  </td>
                </tr>
              )}
              
              {isLoading && (
                [1, 2, 3].map((i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse border-b border-gray-800">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-800 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-6 bg-gray-700 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-700 rounded-full w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-700 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Modal */}
      {evaluatingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Technical Evaluation</h2>
                <p className="text-sm text-gray-400 mt-1">{evaluatingInterview.application?.candidate?.fullName}</p>
              </div>
              {evaluatingInterview.location && (
                <a 
                  href={evaluatingInterview.location} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-500/30 transition-colors"
                >
                  Join Meeting <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Technical Skills (1-5)</label>
                  <input type="range" min="1" max="5" value={evaluation.technicalScore} onChange={e => setEvaluation({...evaluation, technicalScore: parseInt(e.target.value)})} className="w-full accent-indigo-500" />
                  <div className="text-right text-indigo-400 font-bold">{evaluation.technicalScore}/5</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Problem Solving (1-5)</label>
                  <input type="range" min="1" max="5" value={evaluation.problemSolvingScore} onChange={e => setEvaluation({...evaluation, problemSolvingScore: parseInt(e.target.value)})} className="w-full accent-indigo-500" />
                  <div className="text-right text-indigo-400 font-bold">{evaluation.problemSolvingScore}/5</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Feedback</label>
                  <textarea 
                    value={evaluation.feedback}
                    onChange={e => setEvaluation({...evaluation, feedback: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px]"
                    placeholder="Provide specific details about the technical interview..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Recommendation</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setEvaluation({...evaluation, recommendation: 'HIRE'})}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium border transition-colors ${evaluation.recommendation === 'HIRE' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                    >
                      <ThumbsUp className="w-4 h-4" /> Hire
                    </button>
                    <button 
                      onClick={() => setEvaluation({...evaluation, recommendation: 'REJECT'})}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium border transition-colors ${evaluation.recommendation === 'REJECT' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                    >
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={() => setEvaluatingInterview(null)} className="px-5 py-2.5 text-gray-400 hover:text-white font-medium">Cancel</button>
                <button onClick={submitEvaluation} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Submit Evaluation</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;
