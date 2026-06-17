import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Mail, Phone, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import AIReasoningPanel from './AIReasoningPanel';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'SHORTLISTED', 'HIRED', 'REJECTED'];

const CandidateProfileModal = ({ isOpen, onClose, candidate, application, onRefresh }) => {
  if (!isOpen || !candidate) return null;

  const [selectedStage, setSelectedStage] = useState(application?.stage || 'APPLIED');
  const [submitting, setSubmitting] = useState(false);

  const handleOverride = async () => {
    if (!application) return;
    try {
      setSubmitting(true);
      await axiosClient.post(`/applications/${application.id}/override`, {
        stage: selectedStage,
        note: `Recruiter manual override update`
      });
      toast.success(`Candidate stage overridden to ${selectedStage.replace('_', ' ')}!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to manually override candidate stage.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetrigger = async () => {
    if (!application) return;
    try {
      setSubmitting(true);
      await axiosClient.post(`/applications/${application.id}/retrigger-ai`);
      toast.success('AI Screening retriggered in the background!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrigger AI Screening.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-white/10 bg-black/20">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                {candidate.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{candidate.fullName}</h2>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                  {candidate.email && <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {candidate.email}</span>}
                  {candidate.phone && <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {candidate.phone}</span>}
                  {candidate.location && <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {candidate.location}</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* AI Panel (if application exists and has insights or scores) */}
            {application && (application.aiScore !== null || application.overallAIScore !== null) && (
              <AIReasoningPanel 
                score={application.aiScore} 
                insights={application.aiInsights}
                application={application}
              />
            )}

            {/* Recruiter Override Actions */}
            {application && (
              <div className="bg-gray-800/30 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Recruiter Decision Override</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 max-w-xs">
                    <span className="text-xs text-gray-400 font-bold uppercase shrink-0">Stage:</span>
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none w-full"
                    >
                      {STAGES.map(st => (
                        <option key={st} value={st} className="bg-gray-900">{st.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5 shrink-0">
                    <button
                      onClick={handleOverride}
                      disabled={submitting}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                      Override Stage
                    </button>
                    <button
                      onClick={handleRetrigger}
                      disabled={submitting}
                      className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Cpu className="w-3.5 h-3.5" /> Retrigger AI
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.length > 0 ? candidate.skills.map((skill, i) => (
                    <span key={i} className="text-xs uppercase font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-md">
                      {skill}
                    </span>
                  )) : <span className="text-sm text-gray-500 italic">No skills listed</span>}
                </div>
              </div>

              {/* Experience & Education */}
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Experience</h3>
                  <p className="text-white font-medium">
                    {candidate.experience > 0
                      ? `${candidate.experience} ${candidate.experience === 1 ? 'Year' : 'Years'}`
                      : 'Fresher / Intern'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Education</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {candidate.education && candidate.education.trim() !== ''
                      ? candidate.education
                      : 'Not extracted from resume'}
                  </p>
                </div>
                {candidate.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Projects / Internships</h3>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{candidate.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Link */}
            {candidate.resumeUrl && (
              <div className="bg-black/20 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center text-indigo-400">
                  <ExternalLink className="w-5 h-5 mr-3" />
                  <span className="font-medium text-white">Original Resume File</span>
                </div>
                <a 
                  href={candidate.resumeUrl?.startsWith('http') ? candidate.resumeUrl : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000'}${candidate.resumeUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View PDF
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CandidateProfileModal;
