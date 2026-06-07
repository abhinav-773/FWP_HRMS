import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, CheckCircle, AlertCircle, LogOut, Coffee, MapPin, 
  Sparkles, Home, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';

const AttendanceDashboard = () => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [wfh, setWfh] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [breakLoading, setBreakLoading] = useState(false);
  
  const [burnoutData, setBurnoutData] = useState(null);

  // Live Timer State
  const [sessionDuration, setSessionDuration] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/attendance/my-stats');
      setStats(res.data?.data || []);

      // Get Break status
      const breakRes = await axiosClient.get('/attendance/break-status');
      setOnBreak(breakRes.data?.data?.onBreak || false);

      // Get Burnout assessment
      const burnoutRes = await axiosClient.get('/attendance/burnout-check');
      setBurnoutData(burnoutRes.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = stats.find(s => s.date.startsWith(todayStr));

  // Live Timer Effect
  useEffect(() => {
    let interval;
    if (todayRecord && !todayRecord.clockOut && !onBreak) {
      interval = setInterval(() => {
        const start = new Date(todayRecord.clockIn).getTime();
        const now = new Date().getTime();
        const diffMs = now - start;
        // Subtract break time in ms
        const breakMs = (todayRecord.breakTime || 0) * 60 * 1000;
        setSessionDuration(Math.max(0, diffMs - breakMs));
      }, 1000);
    } else if (todayRecord && todayRecord.clockOut) {
      // If clocked out, set to final work hours
      setSessionDuration((todayRecord.workHours || 0) * 3600 * 1000);
    }
    return () => clearInterval(interval);
  }, [todayRecord, onBreak]);

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClockIn = async () => {
    setClocking(true);
    try {
      await axiosClient.post('/attendance/clock-in', { 
        location: wfh ? 'Remote Work' : 'Office HQ',
        workFromHome: wfh
      });
      toast.success('Clocked in successfully!');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to clock in');
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      await axiosClient.post('/attendance/clock-out');
      toast.success('Clocked out successfully!');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to clock out');
    } finally {
      setClocking(false);
    }
  };

  const handleToggleBreak = async () => {
    setBreakLoading(true);
    try {
      const res = await axiosClient.post('/attendance/toggle-break');
      setOnBreak(res.data?.data?.onBreak);
      toast.success(res.data?.data?.onBreak ? 'Break started. Go stretch!' : 'Welcome back!');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to toggle break');
    } finally {
      setBreakLoading(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Attendance Tracking</h2>
          <p className="text-gray-400 mt-1">Log your clock-in timings, breaks, remote shifts, and track team analytics.</p>
        </div>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Clock widget */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden"
          >
            {/* Background highlight */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="h-24 w-24 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
              <Clock className="h-12 w-12 text-indigo-400" />
            </div>
            
            <h3 className="text-3xl font-black text-white mb-1">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h3>
            <p className="text-gray-400 text-sm mb-6">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            {/* WFH Checkbox (only visible if not clocked in yet) */}
            {!todayRecord && (
              <div className="flex items-center gap-3 mb-6 bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setWfh(!wfh)}>
                <Home className={`h-4 w-4 ${wfh ? 'text-indigo-400' : 'text-gray-500'}`} />
                <span className="text-xs text-gray-300 font-bold select-none">Work From Home Shift</span>
                <input 
                  type="checkbox" 
                  checked={wfh} 
                  onChange={() => {}} // Controlled by div click
                  className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4 ml-2"
                />
              </div>
            )}

            {/* Active session indicators */}
            {todayRecord && (
              <div className="mb-6 flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                    todayRecord.workFromHome 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {todayRecord.workFromHome ? 'Remote Shift' : 'Office Shift'}
                  </span>
                  {onBreak && !todayRecord.clockOut && (
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
                      On Break
                    </span>
                  )}
                </div>
                
                {/* LIVE TIMER UI */}
                <div className="bg-gray-900/60 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Session Duration</span>
                  <span className={`text-2xl font-mono font-black tracking-widest ${todayRecord.clockOut ? 'text-gray-400' : 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}>
                    {formatDuration(sessionDuration)}
                  </span>
                </div>
              </div>
            )}

            {/* Shift Actions */}
            <div className="flex flex-col gap-3 w-full">
              {!todayRecord ? (
                <button 
                  onClick={handleClockIn}
                  disabled={clocking}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/20 flex items-center justify-center disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Clock In
                </button>
              ) : !todayRecord.clockOut ? (
                <div className="flex gap-4 w-full">
                  {/* Break Action */}
                  <button 
                    onClick={handleToggleBreak}
                    disabled={breakLoading}
                    className={`flex-1 py-3 border rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      onBreak 
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-500' 
                        : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                    }`}
                  >
                    <Coffee className="h-4 w-4" />
                    {onBreak ? 'Resume Work' : 'Break'}
                  </button>

                  {/* Clock Out */}
                  <button 
                    onClick={handleClockOut}
                    disabled={clocking}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-center disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Clock Out
                  </button>
                </div>
              ) : (
                <div className="py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Completed ({todayRecord.workHours?.toFixed(2)} hrs)
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Center/Right 2 Cols: Stats, Burnout & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Metrics & Burnout Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg">
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Present Days</span>
                <span className="text-3xl font-black text-white mt-1 block">
                  {stats.filter(s => s.status === 'PRESENT').length}
                </span>
              </div>
              <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg">
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Late Marks</span>
                <span className="text-3xl font-black text-yellow-400 mt-1 block">
                  {stats.filter(s => s.status === 'LATE').length}
                </span>
              </div>
            </div>

            {/* AI Burnout Detector */}
            {burnoutData && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
              >
                {/* AI sparks */}
                <div className="absolute top-4 right-4 text-indigo-400 flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  AI Coach
                </div>

                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Burnout Risk</h4>

                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-sm px-4 py-1.5 rounded-full font-black border uppercase tracking-wider ${
                    burnoutData.burnoutRisk === 'HIGH' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse'
                      : burnoutData.burnoutRisk === 'MEDIUM'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                      : 'bg-green-500/10 text-green-400 border-green-500/25'
                  }`}>
                    {burnoutData.burnoutRisk} Risk
                  </span>
                  <div className="text-xs text-gray-400 font-medium">
                    Avg Hours: <span className="text-white font-bold">{burnoutData.avgHours} hrs/day</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-4">
                  {burnoutData.recommendation}
                </p>
              </motion.div>
            )}
          </div>

          {/* History table */}
          <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-black text-white">Attendance History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider bg-white/5">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Clock In / Out</th>
                    <th className="px-6 py-4">Breaks</th>
                    <th className="px-6 py-4">Work Hours</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-white divide-y divide-white/5">
                  {stats.map(record => (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-gray-300">
                        {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          {record.location || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} 
                        {' → '} 
                        {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-indigo-400 font-bold">
                        {record.breakTime > 0 ? `${Math.round(record.breakTime)}m` : '--'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">
                        {record.workHours ? `${record.workHours.toFixed(2)}h` : '--'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
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
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No attendance records logged for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendanceDashboard;
