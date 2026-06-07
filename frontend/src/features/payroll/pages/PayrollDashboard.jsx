import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, Calendar, Activity, CheckCircle, Wallet, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import toast from 'react-hot-toast';

const PayrollDashboard = () => {
  const [slips, setSlips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useSelector(selectCurrentUser);

  const fetchSlips = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/payroll/my-payslips');
      setSlips(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve payslips.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, []);

  const handleGeneratePayroll = async () => {
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      await axiosClient.post('/payroll/generate', { month, year });
      toast.success('Payroll generated successfully for this month!');
      fetchSlips();
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate payroll');
    }
  };

  const handleDownloadPayslip = async (slip) => {
    try {
      const response = await axiosClient.get(`/payroll/${slip.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${slip.month}_${slip.year}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Payslip downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download payslip.');
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Last slip metrics
  const latestSlip = slips[0];
  const basicSalary = latestSlip?.basicSalary || 0;
  const allowances = latestSlip?.allowances || 0;
  const deductions = latestSlip?.deductions || 0;
  const netPay = latestSlip?.netPay || 0;

  // Percentage calculations for visual bar chart breakdown
  const totalBreakdown = basicSalary + allowances + deductions;
  const basicPct = totalBreakdown > 0 ? (basicSalary / totalBreakdown) * 100 : 0;
  const allowancesPct = totalBreakdown > 0 ? (allowances / totalBreakdown) * 100 : 0;
  const deductionsPct = totalBreakdown > 0 ? (deductions / totalBreakdown) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Payroll & Salary Slips</h2>
          <p className="text-gray-400 mt-1">Review your income logs, breakdown charts, and download verified payslips.</p>
        </div>
        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'HR_RECRUITER') && (
          <button 
            onClick={handleGeneratePayroll}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            <Activity className="h-5 w-5" />
            <span>Generate Current Payroll</span>
          </button>
        )}
      </div>

      {/* Grid Dashboard */}
      {latestSlip && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Wallet overview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between h-56"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Net Take-Home Pay</span>
              <Wallet className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-4xl font-black text-white">${netPay.toLocaleString()}</p>
              <p className="text-xs text-indigo-200/60 mt-1">Deposited for period: {monthNames[latestSlip.month - 1]} {latestSlip.year}</p>
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-indigo-200">
              <span className="font-bold uppercase tracking-widest">HireMind PAYROLL</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded">DIRECT DEPOSIT</span>
            </div>
          </motion.div>

          {/* Card 2: Visual Breakdown Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-gray-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-56 flex flex-col justify-between"
          >
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Earnings Breakdown</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>Basic Salary</span>
                <span className="text-white">${basicSalary.toLocaleString()} ({Math.round(basicPct)}%)</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-green-400">
                <span>Allowances</span>
                <span>+${allowances.toLocaleString()} ({Math.round(allowancesPct)}%)</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-red-400">
                <span>Deductions</span>
                <span>-${deductions.toLocaleString()} ({Math.round(deductionsPct)}%)</span>
              </div>
            </div>

            {/* Custom visual progress bar stack */}
            <div className="w-full bg-white/5 h-3 rounded-full flex overflow-hidden border border-white/5">
              <div className="bg-indigo-500 h-full" style={{ width: `${basicPct}%` }} />
              <div className="bg-green-500 h-full" style={{ width: `${allowancesPct}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${deductionsPct}%` }} />
            </div>
          </motion.div>

          {/* Card 3: Last deposit method */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-56 flex flex-col justify-between"
          >
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Transfer Details</h4>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bank Transfer Completed</p>
                <p className="text-xs text-gray-400 mt-0.5">Reference ID: TXN_8819A28B</p>
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-400 border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-400 font-bold">Processed (PAID)</span>
              </div>
              <div className="flex justify-between">
                <span>Frequency:</span>
                <span>Monthly Cycles</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Salary history table */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-black text-white">Salary Ledger History</h3>
        </div>
        
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Month / Cycle</th>
                  <th className="px-6 py-4">Basic Pay</th>
                  <th className="px-6 py-4 text-green-400">Allowances</th>
                  <th className="px-6 py-4 text-red-400">Deductions</th>
                  <th className="px-6 py-4">Net Payout</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-white divide-y divide-white/5">
                {slips.map(slip => (
                  <tr key={slip.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-xs text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                      {monthNames[slip.month - 1]} {slip.year}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      ${slip.basicSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-green-400">
                      +${slip.allowances.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-red-400">
                      -${slip.deductions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-black text-white">
                      ${slip.netPay.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border flex w-fit items-center gap-1 ${
                        slip.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {slip.status === 'PAID' && <CheckCircle className="h-3.5 w-3.5 text-green-400" />}
                        {slip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownloadPayslip(slip)}
                        className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto group"
                      >
                        <Download className="h-3.5 w-3.5 group-hover:scale-115 transition-transform" />
                        Print/Download
                      </button>
                    </td>
                  </tr>
                ))}
                {slips.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No payroll deposits registered for your employee profile.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollDashboard;
