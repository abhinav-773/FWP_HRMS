import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, FileText, CheckCircle, XCircle } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';

const LeaveDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'SICK',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      const res = await axiosClient.get('/leaves/my-leaves');
      setLeaves(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/leaves/apply', formData);
      setShowForm(false);
      fetchLeaves();
      setFormData({ type: 'SICK', startDate: '', endDate: '', reason: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to apply for leave');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Leave Management</h2>
          <p className="text-gray-400 mt-1">Apply for leaves and track your requests.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-white transition-colors shadow-lg shadow-indigo-500/30"
        >
          <Plus className="h-5 w-5" />
          <span>{showForm ? 'Cancel' : 'Apply Leave'}</span>
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/10 border border-white/20 p-6 rounded-xl shadow-lg backdrop-blur-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="MATERNITY">Maternity/Paternity Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
              <textarea 
                required
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                rows="3"
                placeholder="Please provide a reason..."
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats/Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 font-medium">Pending Approvals</h3>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {leaves.filter(l => l.status === 'PENDING').length}
            </p>
          </div>
          <Calendar className="h-12 w-12 text-yellow-500/20" />
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 font-medium">Leaves Taken (YTD)</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {leaves.filter(l => l.status === 'APPROVED').length}
            </p>
          </div>
          <CheckCircle className="h-12 w-12 text-green-500/20" />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Applied On</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {leaves.map(record => (
                <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {record.type}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(record.startDate).toLocaleDateString()} to {new Date(record.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                    {record.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex w-fit items-center gap-1 ${
                      record.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      record.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {record.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                      {record.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveDashboard;
