import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';

const AttendanceDashboard = () => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/attendance/my-stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClockIn = async () => {
    setClocking(true);
    setError('');
    try {
      await axiosClient.post('/attendance/clock-in', { location: 'Office HQ' });
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clock in');
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    setError('');
    try {
      await axiosClient.post('/attendance/clock-out');
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clock out');
    } finally {
      setClocking(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = stats.find(s => s.date.startsWith(todayStr));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">My Attendance</h2>
        <p className="text-gray-400 mt-1">Track your daily work hours and history.</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clock Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg"
        >
          <div className="h-24 w-24 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6">
            <Clock className="h-12 w-12 text-indigo-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h3>
          <p className="text-gray-400 mb-8">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

          {!todayRecord ? (
            <button 
              onClick={handleClockIn}
              disabled={clocking}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition-colors shadow-lg shadow-green-500/30 flex items-center disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Clock In
            </button>
          ) : !todayRecord.clockOut ? (
            <button 
              onClick={handleClockOut}
              disabled={clocking}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-colors shadow-lg shadow-red-500/30 flex items-center disabled:opacity-50"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Clock Out
            </button>
          ) : (
            <div className="px-8 py-3 bg-gray-700 text-gray-300 rounded-full font-bold flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              Completed ({todayRecord.workHours?.toFixed(2)} hrs)
            </div>
          )}
        </motion.div>

        {/* Stats Card */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
            <h3 className="text-gray-400 font-medium">Monthly Present Days</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {stats.filter(s => s.status === 'PRESENT').length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
            <h3 className="text-gray-400 font-medium">Late Marks</h3>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {stats.filter(s => s.status === 'LATE').length}
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Clock In</th>
                <th className="px-6 py-4 font-medium">Clock Out</th>
                <th className="px-6 py-4 font-medium">Work Hours</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats.map(record => (
                <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '--'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '--'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {record.workHours ? `${record.workHours.toFixed(2)}h` : '--'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      record.status === 'PRESENT' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      record.status === 'LATE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No attendance records found for this month.
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

export default AttendanceDashboard;
