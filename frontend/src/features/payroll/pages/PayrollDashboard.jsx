import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, Calendar, Activity, CheckCircle } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/slices/authSlice';

const PayrollDashboard = () => {
  const [slips, setSlips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useSelector(selectCurrentUser);

  const fetchSlips = async () => {
    try {
      const res = await axiosClient.get('/payroll/my-payslips');
      setSlips(res.data.data);
    } catch (error) {
      console.error(error);
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
      alert('Payroll generated successfully');
      fetchSlips();
    } catch (error) {
      console.error(error);
      alert('Failed to generate payroll');
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Payroll & Payslips</h2>
          <p className="text-gray-400 mt-1">View your salary history and download payslips.</p>
        </div>
        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'HR_RECRUITER') && (
          <button 
            onClick={handleGeneratePayroll}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-white transition-colors shadow-lg shadow-indigo-500/30"
          >
            <Activity className="h-5 w-5" />
            <span>Generate Current Payroll</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Last Net Pay</h3>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            ${slips.length > 0 ? slips[0].netPay.toLocaleString() : '0.00'}
          </p>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Salary History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium">Month/Year</th>
                <th className="px-6 py-4 font-medium">Basic Salary</th>
                <th className="px-6 py-4 font-medium text-green-400">Allowances</th>
                <th className="px-6 py-4 font-medium text-red-400">Deductions</th>
                <th className="px-6 py-4 font-medium text-white">Net Pay</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {slips.map(slip => (
                <tr key={slip.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                    {monthNames[slip.month - 1]} {slip.year}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    ${slip.basicSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-green-400">
                    +${slip.allowances.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-red-400">
                    -${slip.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    ${slip.netPay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex w-fit items-center gap-1 ${
                      slip.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {slip.status === 'PAID' && <CheckCircle className="h-3 w-3" />}
                      {slip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors inline-flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
              {slips.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No payslips found.
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

export default PayrollDashboard;
