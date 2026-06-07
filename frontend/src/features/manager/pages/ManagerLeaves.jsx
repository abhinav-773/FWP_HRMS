import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, User, FileText, ChevronRight } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';
import { useSocket } from '../../../contexts/SocketContext';

const ManagerLeaves = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [historyLeaves, setHistoryLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, history
  const socket = useSocket();

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        axiosClient.get('/leaves/manager/pending'),
        axiosClient.get('/leaves/team')
      ]);
      setPendingLeaves(pendingRes.data?.data || []);
      
      const history = (allRes.data?.data || []).filter(l => l.status !== 'PENDING');
      setHistoryLeaves(history);
    } catch (err) {
      console.warn('Failed to load leave requests', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('LEAVE_REQUESTED', () => {
        toast('New leave request received', { icon: '📅' });
        fetchLeaves();
      });
      return () => {
        socket.off('LEAVE_REQUESTED');
      };
    }
  }, [socket]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'APPROVE') {
        await axiosClient.patch(`/leaves/${id}/approve`);
        toast.success('Leave approved successfully');
      } else {
        await axiosClient.patch(`/leaves/${id}/reject`);
        toast.success('Leave rejected');
      }
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const calculateDays = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Team Leave Requests</h2>
          <p className="text-gray-400 mt-1">Review and manage time-off requests from your team.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          Pending Approvals
          {pendingLeaves.length > 0 && (
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs ml-2">
              {pendingLeaves.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          Leave History
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {(activeTab === 'pending' ? pendingLeaves : historyLeaves).length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center"
              >
                <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300">All caught up!</h3>
                <p className="text-gray-500 mt-2">No {activeTab} leave requests at the moment.</p>
              </motion.div>
            ) : (
              (activeTab === 'pending' ? pendingLeaves : historyLeaves).map((leave) => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 justify-between items-center hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex items-start gap-5 w-full lg:w-auto">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{leave.employee.user.fullName}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                        <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                          {calculateDays(leave.startDate, leave.endDate)} Day(s)
                        </span>
                        <span className="font-bold uppercase tracking-wider text-xs bg-white/5 px-3 py-1 rounded-full">
                          {leave.type}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-gray-300 bg-black/20 p-4 rounded-xl border border-white/5 italic">
                        "{leave.reason}"
                      </p>
                    </div>
                  </div>

                  {activeTab === 'pending' ? (
                    <div className="flex w-full lg:w-auto items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleAction(leave.id, 'REJECT')}
                        className="flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(leave.id, 'APPROVE')}
                        className="flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold bg-green-500 text-white hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center shrink-0">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ManagerLeaves;
