import React, { useState } from 'react';
import { Calendar, Clock, Video, User, Check, X, Users, Link as LinkIcon, Info, Globe } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';

const InterviewScheduler = ({ application, onClose, onScheduled }) => {
  const [interviewType, setInterviewType] = useState('AI'); // 'AI' or 'FACE_TO_FACE'
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [timezone, setTimezone] = useState('GMT+5:30 (IST)');
  const [interviewerName, setInterviewerName] = useState('');
  const [meetingProvider, setMeetingProvider] = useState('GOOGLE_MEET');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [notes, setNotes] = useState('');
  
  // Rounds multi-select
  const [selectedRounds, setSelectedRounds] = useState(['Technical Round']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roundsList = ['Technical Round', 'HR Round', 'Managerial Round'];

  const toggleRound = (round) => {
    if (selectedRounds.includes(round)) {
      setSelectedRounds(selectedRounds.filter(r => r !== round));
    } else {
      setSelectedRounds([...selectedRounds, round]);
    }
  };

  const handleSchedule = async () => {
    if (!date || !time) {
      setError('Please select both date and time.');
      return;
    }

    if (interviewType === 'FACE_TO_FACE') {
      if (selectedRounds.length === 0) {
        setError('Please select at least one interview round.');
        return;
      }
      if (!meetingUrl) {
        setError('Please provide a meeting link (Zoom, Meet, or Teams URL).');
        return;
      }
      if (!interviewerName.trim()) {
        setError('Please provide the interviewer\'s name.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const payload = {
        applicationId: application.id,
        interviewerId: application.job.postedById || application.candidate.assignedToId,
        scheduledAt,
        durationMins: parseInt(duration, 10),
        interviewType,
      };

      if (interviewType === 'AI') {
        payload.type = 'AI_VOICE';
      } else {
        payload.type = 'TECHNICAL';
        payload.meetingProvider = meetingProvider;
        payload.location = meetingUrl;
        payload.interviewRounds = selectedRounds;
        payload.interviewerName = interviewerName;
        payload.interviewNotes = `Timezone: ${timezone}\n\nNotes: ${notes}`;
      }

      const response = await axiosClient.post('/interviews', payload);

      onScheduled(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-indigo-900/20">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Video className="w-5 h-5 mr-2 text-indigo-400" />
            Schedule Interview
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Mode Switch */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Interview Mode
            </label>
            <div className="grid grid-cols-2 gap-3 bg-gray-800 p-1 rounded-xl border border-gray-700">
              <button
                type="button"
                onClick={() => setInterviewType('AI')}
                className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                  interviewType === 'AI'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                AI Interview
              </button>
              <button
                type="button"
                onClick={() => setInterviewType('FACE_TO_FACE')}
                className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                  interviewType === 'FACE_TO_FACE'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Face-to-Face
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Candidate Box */}
            <div className="bg-gray-800/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Candidate</p>
                <p className="text-white font-medium flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-indigo-400" />
                  {application.candidate.fullName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Job Title</p>
                <p className="text-indigo-300 font-medium text-sm">
                  {application.job.title}
                </p>
              </div>
            </div>

            {/* Date and Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Timezone and Duration Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                  <Globe className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Timezone
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. GMT+5:30 (IST)"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                </select>
              </div>
            </div>

            {/* AI Specific Helper Text */}
            {interviewType === 'AI' && (
              <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-lg flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-200 leading-relaxed">
                  The AI recruitment assistant will automatically host the interview at this date/time. The candidate will receive a unique link to join our interactive browser voice prep room.
                </p>
              </div>
            )}

            {/* Face to Face Fields */}
            {interviewType === 'FACE_TO_FACE' && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                {/* Select Rounds */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Interview Rounds
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roundsList.map((round) => {
                      const isSelected = selectedRounds.includes(round);
                      return (
                        <button
                          key={round}
                          type="button"
                          onClick={() => toggleRound(round)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {round}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interviewer Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="e.g. John Doe (Engineering Lead)"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                </div>

                {/* Provider & Meeting URL */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Provider
                    </label>
                    <select
                      value={meetingProvider}
                      onChange={(e) => setMeetingProvider(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                    >
                      <option value="GOOGLE_MEET">Google Meet</option>
                      <option value="ZOOM">Zoom</option>
                      <option value="MS_TEAMS">MS Teams</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
                      <LinkIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Instructions / Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Recruiter Notes / Instructions for Candidate
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Provide any details about prep, agenda, or specific systems to install."
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/50 transition-all flex items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;
