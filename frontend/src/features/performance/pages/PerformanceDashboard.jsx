import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import { 
  Award, CheckCircle2, TrendingUp, Sparkles, Plus, RefreshCw, 
  User, Calendar, ListTodo, MessageSquare, Clipboard, Send 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../../contexts/SocketContext';

const PerformanceDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('goals');
  const socket = useSocket();

  // AI Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Form States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    employeeId: '',
    title: '',
    description: '',
    targetDate: ''
  });

  const [feedbackForm, setFeedbackForm] = useState({
    employeeId: '',
    reviewPeriod: 'Q2 2026',
    feedbackText: '',
    rating: 5
  });

  const [managerReviewForm, setManagerReviewForm] = useState({
    employeeId: '',
    reviewPeriod: 'Q2 2026',
    rating: 5,
    comments: ''
  });
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Get current user profile
      const localUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      setCurrentUser(localUser);

      // Fetch employee goals
      const goalsRes = await axiosClient.get('/performance/my-goals');
      setGoals(goalsRes.data?.data || []);

      // Fetch employee tasks
      const tasksRes = await axiosClient.get('/tasks/my-tasks').catch(() => ({ data: { data: [] } }));
      setTasks(tasksRes.data?.data || []);

      // Fetch employee reviews
      const reviewsRes = await axiosClient.get('/performance/my-reviews');
      setReviews(reviewsRes.data?.data || []);
      if (reviewsRes.data?.data?.length > 0 && reviewsRes.data.data[0].aiSummary) {
        setAiSummary(reviewsRes.data.data[0].aiSummary);
      }

      // Fetch received feedback
      const feedbackRes = await axiosClient.get('/performance/my-feedback');
      setFeedbacks(feedbackRes.data?.data || []);

      // Fetch all employees (for manager creation / peer selection dropdowns)
      const empRes = await axiosClient.get('/employees');
      setEmployees(empRes.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load performance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('TASK_ASSIGNED', (task) => {
        toast.success(`New task assigned: ${task.title}`);
        fetchPerformanceData();
      });
      return () => {
        socket.off('TASK_ASSIGNED');
      };
    }
  }, [socket]);

  const handleUpdateProgress = async (goalId, val) => {
    try {
      const status = val >= 100 ? 'ACHIEVED' : 'ACTIVE';
      await axiosClient.put(`/performance/goals/${goalId}`, { progress: val, status });
      toast.success('OKR progress updated!');
      // Update local state without full reload
      setGoals(goals.map(g => g.id === goalId ? { ...g, progress: val, status } : g));
    } catch (error) {
      console.error(error);
      toast.error('Failed to update progress.');
    }
  };

  const handleUpdateTaskProgress = async (taskId, val) => {
    try {
      const status = val >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
      await axiosClient.patch(`/tasks/${taskId}/progress`, { progress: val, status });
      toast.success('Task progress updated!');
      setTasks(tasks.map(t => t.id === taskId ? { ...t, progress: val, status } : t));
    } catch (error) {
      console.error(error);
      toast.error('Failed to update task progress.');
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.employeeId || !newGoal.title) {
      toast.error('Please fill in required fields.');
      return;
    }

    try {
      await axiosClient.post('/performance/goals', newGoal);
      toast.success('Goal assigned successfully!');
      setShowGoalModal(false);
      setNewGoal({ employeeId: '', title: '', description: '', targetDate: '' });
      fetchPerformanceData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to assign goal.');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!managerReviewForm.employeeId || !managerReviewForm.comments) {
      toast.error('Please fill in comments.');
      return;
    }

    try {
      await axiosClient.post('/performance/reviews', managerReviewForm);
      toast.success('Performance Review logged successfully!');
      setShowReviewModal(false);
      setManagerReviewForm({ employeeId: '', reviewPeriod: 'Q2 2026', rating: 5, comments: '' });
      fetchPerformanceData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit review.');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.employeeId || !feedbackForm.feedbackText) {
      toast.error('Please complete all feedback fields.');
      return;
    }

    try {
      await axiosClient.post('/performance/feedback', feedbackForm);
      toast.success('Peer feedback submitted successfully!');
      setFeedbackForm({ employeeId: '', reviewPeriod: 'Q2 2026', feedbackText: '', rating: 5 });
      fetchPerformanceData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit peer feedback.');
    }
  };

  const handleRequestAiSummary = async (empId, period) => {
    setGeneratingAi(true);
    try {
      const res = await axiosClient.post('/performance/ai-summary', { employeeId: empId, reviewPeriod: period });
      setAiSummary(res.data?.data);
      toast.success('AI Performance Assessment generated!');
      fetchPerformanceData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate AI performance summary.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const isHRorAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'HR_RECRUITER';
  const isManager = currentUser?.role === 'SENIOR_MANAGER' || isHRorAdmin;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white">Performance Management</h1>
          <p className="text-indigo-200 mt-2 font-medium">Track your OKR goals, review quarterly performance metrics, and submit peer coaching feedback.</p>
        </div>
        <div className="flex gap-4 relative z-10">
          {isManager && (
            <>
              <button
                onClick={() => setShowGoalModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                <Plus className="h-5 w-5" />
                Assign OKR
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
              >
                <Award className="h-5 w-5 text-indigo-400" />
                Submit Evaluation
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-8 overflow-x-auto whitespace-nowrap pb-2">
        <button
          onClick={() => setActiveTab('goals')}
          className={`pb-4 text-sm font-bold tracking-wider relative transition-colors ${
            activeTab === 'goals' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          OKR Goals
          {activeTab === 'goals' && (
            <motion.div layoutId="perf-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-4 text-sm font-bold tracking-wider relative transition-colors ${
            activeTab === 'tasks' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Daily Tasks
          {activeTab === 'tasks' && (
            <motion.div layoutId="perf-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 text-sm font-bold tracking-wider relative transition-colors ${
            activeTab === 'reviews' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Quarterly Reviews & AI Summary
          {activeTab === 'reviews' && (
            <motion.div layoutId="perf-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-4 text-sm font-bold tracking-wider relative transition-colors ${
            activeTab === 'feedback' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Submit Peer Feedback
          {activeTab === 'feedback' && (
            <motion.div layoutId="perf-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Main Views */}
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : activeTab === 'goals' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {goals.length === 0 ? (
              <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-8 text-center text-gray-500">
                No goals assigned yet. Contact your reporting manager.
              </div>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{goal.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{goal.description}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      goal.status === 'ACHIEVED' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {goal.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${goal.progress}%` }} />
                    </div>

                    {/* Progress slider */}
                    <div className="pt-2">
                      <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Adjust Progress</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={goal.progress}
                        onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                        className="w-full accent-indigo-500 bg-white/5 h-1.5 rounded-lg cursor-pointer border border-white/5"
                      />
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Side card checklist representation */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-fit">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Goal Management Instructions</h3>
            <ul className="space-y-3 text-xs text-gray-400 list-disc list-inside">
              <li>Goals should align with departmental OKRs.</li>
              <li>Managers can allocate target dates and descriptions.</li>
              <li>Employees can update their progress dynamically using sliders.</li>
              <li>Goals marked as 100% will automatically flag as "ACHIEVED".</li>
            </ul>
          </div>
        </div>
      ) : activeTab === 'tasks' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {tasks.length === 0 ? (
              <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-8 text-center text-gray-500">
                No daily tasks assigned yet.
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{task.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{task.description}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      task.status === 'COMPLETED' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${task.progress}%` }} />
                    </div>

                    {/* Progress slider */}
                    <div className="pt-2">
                      <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Adjust Progress</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={task.progress}
                        onChange={(e) => handleUpdateTaskProgress(task.id, parseInt(e.target.value))}
                        className="w-full accent-indigo-500 bg-white/5 h-1.5 rounded-lg cursor-pointer border border-white/5"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Assigned By: {task.assignedBy?.user?.fullName}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-gray-400">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Side card checklist representation */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-fit">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Task Management Instructions</h3>
            <ul className="space-y-3 text-xs text-gray-400 list-disc list-inside">
              <li>These are daily operational tasks assigned by managers.</li>
              <li>Keep the progress updated in real-time.</li>
              <li>When progress hits 100%, your manager is automatically notified.</li>
            </ul>
          </div>
        </div>
      ) : activeTab === 'reviews' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Review items */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Manager Evaluations</h3>
            {reviews.length === 0 ? (
              <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-6 text-center text-gray-500 text-xs">
                No formal evaluations logged yet.
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{rev.reviewPeriod}</span>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                      Rating: {rev.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 italic">"{rev.comments}"</p>
                  <p className="text-[10px] text-gray-500">Evaluated by: {rev.reviewer?.user?.fullName || 'Manager'}</p>
                </div>
              ))
            )}
          </div>

          {/* AI Summary Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Performance summary</h3>
              {isManager && employees.length > 0 && (
                <button
                  disabled={generatingAi}
                  onClick={() => handleRequestAiSummary(goals[0]?.employeeId || employees[0]?.id, 'Q2 2026')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {generatingAi ? 'Analyzing...' : 'Generate AI Coach Summary'}
                </button>
              )}
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative min-h-[300px]">
              {generatingAi ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/20 backdrop-blur-sm rounded-3xl space-y-4">
                  <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compiling goals, manager logs, and peer evaluations...</p>
                </div>
              ) : aiSummary ? (
                <div className="prose prose-invert max-w-none text-xs text-gray-300 space-y-4">
                  {aiSummary.split('\n').map((line, idx) => {
                    if (line.startsWith('#')) return <h4 key={idx} className="text-white font-black text-sm uppercase mt-4">{line.replace(/#/g, '').trim()}</h4>;
                    if (line.startsWith('-')) return <li key={idx} className="ml-4 list-disc">{line.replace('-', '').trim()}</li>;
                    return <p key={idx}>{line}</p>;
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 space-y-3">
                  <Sparkles className="h-8 w-8 text-indigo-500/40" />
                  <p className="text-xs">No AI Coach summary compiled yet. Request manager to generate assessment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Peer Feedback Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submit Feedback form */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-fit">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Give Peer Feedback</h3>
            
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Select Peer</label>
                <select
                  value={feedbackForm.employeeId}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, employeeId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled className="bg-gray-900 text-gray-400">Select Colleague...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-gray-900 text-white">
                      {emp.user?.fullName} ({emp.designation?.title || 'Member'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Rating</label>
                <select
                  value={feedbackForm.rating}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                >
                  <option className="bg-gray-900 text-white" value="5">5/5 - Outstanding</option>
                  <option className="bg-gray-900 text-white" value="4">4/5 - Exceeds Expectations</option>
                  <option className="bg-gray-900 text-white" value="3">3/5 - Meets Expectations</option>
                  <option className="bg-gray-900 text-white" value="2">2/5 - Needs Improvement</option>
                  <option className="bg-gray-900 text-white" value="1">1/5 - Unsatisfactory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Feedback Notes</label>
                <textarea
                  value={feedbackForm.feedbackText}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackText: e.target.value })}
                  placeholder="Share details of their performance, strengths, or suggestions..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                Submit Feedback
              </button>
            </form>
          </div>

          {/* Feedback Received List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Feedback Received</h3>
            
            {feedbacks.length === 0 ? (
              <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-12 text-center text-gray-500 text-xs">
                No peer comments received for the current cycle.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400">Sender: {fb.peer?.user?.fullName || 'Anonymous'}</span>
                      <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/20 font-mono">
                        Rating: {fb.rating}/5
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 italic">"{fb.feedbackText}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goal Allocation Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden"
            >
              <h2 className="text-xl font-black text-white">Assign OKR Goal</h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Select Employee</label>
                  <select
                    value={newGoal.employeeId}
                    onChange={(e) => setNewGoal({ ...newGoal, employeeId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-400">Choose Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-gray-900 text-white">
                        {emp.user?.fullName} ({emp.designation?.title || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Goal Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Implement WebSockets architecture"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">OKR Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                  >
                    Assign Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden"
            >
              <h2 className="text-xl font-black text-white">Submit Manager Evaluation</h2>
              <form onSubmit={handleCreateReview} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Select Employee</label>
                  <select
                    value={managerReviewForm.employeeId}
                    onChange={(e) => setManagerReviewForm({ ...managerReviewForm, employeeId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-400">Choose Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-gray-900 text-white">
                        {emp.user?.fullName} ({emp.designation?.title || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Rating</label>
                  <select
                    value={managerReviewForm.rating}
                    onChange={(e) => setManagerReviewForm({ ...managerReviewForm, rating: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  >
                    <option className="bg-gray-900 text-white" value="5">5/5 - Outstanding</option>
                    <option className="bg-gray-900 text-white" value="4">4/5 - Exceeds Expectations</option>
                    <option className="bg-gray-900 text-white" value="3">3/5 - Meets Expectations</option>
                    <option className="bg-gray-900 text-white" value="2">2/5 - Needs Improvement</option>
                    <option className="bg-gray-900 text-white" value="1">1/5 - Unsatisfactory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Evaluation Comments</label>
                  <textarea
                    value={managerReviewForm.comments}
                    onChange={(e) => setManagerReviewForm({ ...managerReviewForm, comments: e.target.value })}
                    placeholder="Log comprehensive quarterly evaluation notes..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                  >
                    Submit Evaluation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceDashboard;
