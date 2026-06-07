import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import { toast } from 'react-hot-toast';
import { Award, Star, Search, Send, User, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RatingStars = ({ value, onChange, label }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-900/50 border border-white/5 rounded-xl">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-all ${star <= value ? 'text-yellow-400 scale-110 drop-shadow-md' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Star className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

const PerformanceReviews = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    technicalRating: 0,
    communicationRating: 0,
    productivityRating: 0,
    teamworkRating: 0,
    strengths: '',
    weaknesses: '',
    managerRemarks: '',
    reviewPeriod: 'Q3 2026'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get('/manager/team-members');
      setEmployees(res.data?.data || []);
    } catch (err) {
      console.warn('Failed to load employees', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    if (!reviewForm.technicalRating || !reviewForm.communicationRating || !reviewForm.productivityRating || !reviewForm.teamworkRating) {
      return toast.error('Please complete all rating categories');
    }

    setIsSubmitting(true);
    const payload = {
      employeeId: selectedEmp.id,
      ...reviewForm,
      strengths: reviewForm.strengths.split(',').map(s => s.trim()).filter(Boolean),
      weaknesses: reviewForm.weaknesses.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      await axiosClient.post('/manager/reviews', payload);
      toast.success('Performance review submitted successfully!');
      setSelectedEmp(null);
      setReviewForm({
        technicalRating: 0, communicationRating: 0, productivityRating: 0, teamworkRating: 0,
        strengths: '', weaknesses: '', managerRemarks: '', reviewPeriod: 'Q3 2026'
      });
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.user?.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    emp.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Award className="w-8 h-8 text-purple-400" />
          Performance Reviews
        </h1>
        <p className="text-gray-400 mt-1">Evaluate team members to generate AI-assisted performance profiles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Employee Roster */}
        <div className="lg:col-span-4 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[800px] flex flex-col">
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search team member..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id}
                onClick={() => setSelectedEmp(emp)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedEmp?.id === emp.id ? 'bg-purple-500/10 border-purple-500/50' : 'bg-gray-900/50 border-white/5 hover:border-white/20'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                  {emp.user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-white text-sm font-semibold truncate">{emp.user?.fullName}</h4>
                  <p className="text-xs text-gray-400 truncate">{emp.employeeId} • {emp.designation?.title || 'Employee'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedEmp ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shrink-0">
                      {selectedEmp.user?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedEmp.user?.fullName}</h2>
                      <p className="text-sm text-gray-400">Evaluating for {reviewForm.reviewPeriod}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-semibold flex items-center gap-2 border border-purple-500/30">
                    <BrainCircuit className="w-4 h-4" /> AI Summary Enabled
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Core Competencies</h3>
                    <RatingStars label="Technical Skills" value={reviewForm.technicalRating} onChange={(v) => setReviewForm({...reviewForm, technicalRating: v})} />
                    <RatingStars label="Communication" value={reviewForm.communicationRating} onChange={(v) => setReviewForm({...reviewForm, communicationRating: v})} />
                    <RatingStars label="Productivity" value={reviewForm.productivityRating} onChange={(v) => setReviewForm({...reviewForm, productivityRating: v})} />
                    <RatingStars label="Teamwork" value={reviewForm.teamworkRating} onChange={(v) => setReviewForm({...reviewForm, teamworkRating: v})} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Qualitative Assessment</h3>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Strengths (comma separated)</label>
                      <input 
                        required
                        value={reviewForm.strengths}
                        onChange={e => setReviewForm({...reviewForm, strengths: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        placeholder="e.g., Problem solving, Mentoring"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Areas for Improvement (comma separated)</label>
                      <input 
                        required
                        value={reviewForm.weaknesses}
                        onChange={e => setReviewForm({...reviewForm, weaknesses: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        placeholder="e.g., Time management, Documentation"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Manager Remarks</label>
                      <textarea 
                        required
                        value={reviewForm.managerRemarks}
                        onChange={e => setReviewForm({...reviewForm, managerRemarks: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[100px] resize-none"
                        placeholder="Detailed performance notes..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 border border-purple-500/20 rounded-xl text-sm text-gray-300 flex items-start gap-3">
                  <BrainCircuit className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <p>Upon submission, the HireMind AI will instantly analyze these scores and qualitative metrics to generate a comprehensive <strong>Performance Summary Profile</strong> that will be stored in the employee's official record.</p>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                  >
                    {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Send className="w-5 h-5" />}
                    {isSubmitting ? 'Generating AI Summary...' : 'Submit Final Review'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800/20 border border-dashed border-white/10 rounded-2xl h-[800px] flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl text-white font-bold mb-2">Select a Team Member</h3>
                <p className="text-gray-500 max-w-sm">Choose an employee from the roster on the left to begin filling out their qualitative and quantitative performance appraisal.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReviews;
