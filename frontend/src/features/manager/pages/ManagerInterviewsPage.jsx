import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import { Users, Clock, Send, CheckCircle, Video, Calendar, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerInterviewsPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Round');
  const [meetingMode, setMeetingMode] = useState('Google Meet');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [notes, setNotes] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [teamRes, interviewsRes] = await Promise.all([
        axiosClient.get('/manager/team-members'),
        axiosClient.get('/interviews/manager')
      ]);

      setTeamMembers(teamRes.data?.data || []);
      setInterviews(interviewsRes.data?.data || []);
    } catch (error) {
      console.warn('Failed to load manager interviews data', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !interviewTitle || !interviewDate || !interviewTime) {
      return toast.error('Please fill required fields.');
    }

    try {
      await axiosClient.post('/interviews/create', {
        employeeId: selectedEmployee,
        title: interviewTitle,
        type: interviewType,
        meetingMode,
        date: interviewDate,
        time: interviewTime,
        notes
      });
      toast.success('Interview created successfully.');
      setShowScheduleForm(false);
      resetForm();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create interview.');
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setInterviewTitle('');
    setInterviewDate('');
    setInterviewTime('');
    setNotes('');
  };

  const handleSendLink = async (interviewId, employeeId) => {
    try {
      // For HireMind AI Interview, we could generate a dynamic link or just a mock one.
      const meetingLink = `https://meet.google.com/mock-${Math.random().toString(36).substring(7)}`;
      await axiosClient.post('/interviews/send-link', {
        interviewId,
        employeeId,
        meetingLink
      });
      toast.success('Interview link sent successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send link.');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Team Interviews</h1>
        <p className="text-gray-400 mt-1">Manage technical interviews, send links, and view AI insights.</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowScheduleForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <Calendar className="w-5 h-5" /> Schedule Interview
        </button>
      </div>

      {showScheduleForm && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative">
          <button onClick={() => setShowScheduleForm(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
          <h2 className="text-xl font-bold text-white mb-6">Schedule Interview</h2>
          <form onSubmit={handleScheduleInterview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Team Member</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="" className="bg-gray-900">Select Member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id} className="bg-gray-900">{member.user?.fullName} ({member.department?.name || 'N/A'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interview Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Technical Review"
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Technical Round" className="bg-gray-900">Technical Round</option>
                  <option value="Culture Fit" className="bg-gray-900">Culture Fit</option>
                  <option value="Performance Review" className="bg-gray-900">Performance Review</option>
                  <option value="Promotion Assessment" className="bg-gray-900">Promotion Assessment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Meeting Mode</label>
                <select
                  value={meetingMode}
                  onChange={(e) => setMeetingMode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Google Meet" className="bg-gray-900">Google Meet</option>
                  <option value="Zoom" className="bg-gray-900">Zoom</option>
                  <option value="Microsoft Teams" className="bg-gray-900">Microsoft Teams</option>
                  <option value="HireMind AI Interview" className="bg-gray-900">HireMind AI Interview</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Time</label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 h-24"
                placeholder="Interview agenda or specific focus areas..."
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">
              Save Interview Details
            </button>
          </form>
        </div>
      )}

      {/* Tables & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Upcoming Interviews */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">Upcoming Interviews</h2>
          {interviews.length === 0 ? (
            <div className="text-center py-10 bg-gray-800/30 border border-white/5 rounded-2xl">
              <p className="text-gray-400">No upcoming interviews scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map(interview => (
                <div key={interview.id} className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{interview.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {interview.employee?.user?.fullName} • {interview.date} at {interview.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                      {interview.status}
                    </span>
                    
                    {!interview.meetingLink ? (
                      <button
                        onClick={() => handleSendLink(interview.id, interview.employeeId)}
                        className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                      >
                        <Send className="w-4 h-4" /> Send Link
                      </button>
                    ) : (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                      >
                        <Video className="w-4 h-4" /> Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: AI Insights (Dummy Data for Demo) */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">AI Insights</h2>
          <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white">Recent Interview Analysis</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-400">Communication Score</span>
                  <span className="text-white">88%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-400">Technical Score</span>
                  <span className="text-white">92%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-400">Confidence Score</span>
                  <span className="text-white">85%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Recommendation</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                Candidate demonstrated strong problem-solving skills and excellent system design knowledge. Recommended for fast-track promotion consideration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerInterviewsPage;
