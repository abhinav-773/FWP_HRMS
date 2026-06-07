import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, MessageSquare, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const LeaveApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axiosClient.get('/manager/leaves');
      setRequests(res.data);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (status) => {
    if (!selectedRequest) return;
    try {
      await axiosClient.put(`/manager/leaves/${selectedRequest.id}`, { status, managerRemarks: remarks });
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status, managerRemarks: remarks } : r));
      setSelectedRequest(null);
      setRemarks('');
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error('Failed to process leave request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const pastRequests = requests.filter(r => r.status !== 'PENDING');

  if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Leave Approvals</h1>
        <p className="text-gray-400 mt-1">Review and manage team time-off requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inbox / List View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-indigo-400" /> Action Required
              <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">{pendingRequests.length}</span>
            </h2>

            <div className="space-y-4">
              <AnimatePresence>
                {pendingRequests.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                    No pending leave requests! 🎉
                  </motion.div>
                ) : (
                  pendingRequests.map((req) => (
                    <motion.div 
                      key={req.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedRequest?.id === req.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-gray-900 border-white/5 hover:border-white/20'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                            {req.employee?.user?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{req.employee?.user?.fullName}</h3>
                            <p className="text-sm text-gray-400">{req.type} LEAVE</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white font-medium">
                            {differenceInDays(new Date(req.endDate), new Date(req.startDate)) + 1} Days
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(req.startDate), 'MMM dd')} - {format(new Date(req.endDate), 'MMM dd')}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Past History */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Approval History</h2>
            <div className="space-y-3">
              {pastRequests.slice(0, 5).map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
                  <div>
                    <h4 className="text-white text-sm font-medium">{req.employee?.user?.fullName}</h4>
                    <p className="text-xs text-gray-500">{format(new Date(req.startDate), 'MMM dd')} • {req.type}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
              ))}
              {pastRequests.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No past requests.</p>}
            </div>
          </div>
        </div>

        {/* Details & Action Panel */}
        <div className="col-span-1">
          {selectedRequest ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 sticky top-8 shadow-2xl shadow-indigo-500/10"
            >
              <h2 className="text-xl font-bold text-white mb-6">Review Request</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Employee</label>
                  <div className="flex items-center gap-2 text-white font-medium bg-gray-900/50 p-3 rounded-xl border border-white/5">
                    <User className="w-4 h-4 text-indigo-400" />
                    {selectedRequest.employee?.user?.fullName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Duration</label>
                    <div className="text-white font-medium bg-gray-900/50 p-3 rounded-xl border border-white/5">
                      {differenceInDays(new Date(selectedRequest.endDate), new Date(selectedRequest.startDate)) + 1} Days
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Type</label>
                    <div className="text-white font-medium bg-gray-900/50 p-3 rounded-xl border border-white/5">
                      {selectedRequest.type}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Reason Provided</label>
                  <div className="text-gray-300 text-sm bg-gray-900/50 p-4 rounded-xl border border-white/5 leading-relaxed min-h-[80px]">
                    "{selectedRequest.reason}"
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Manager Remarks (Optional)</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] resize-none"
                    placeholder="Add a note for the employee..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => handleAction('REJECTED')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2.5 rounded-xl transition-colors font-medium"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction('APPROVED')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 py-2.5 rounded-xl transition-colors font-medium"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-800/20 border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-white font-medium">Select a request</h3>
              <p className="text-sm text-gray-500 mt-1">Click on a pending leave request from the inbox to review details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovals;
