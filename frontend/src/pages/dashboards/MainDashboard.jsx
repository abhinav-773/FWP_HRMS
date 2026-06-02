import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';

const AdminDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">Super Admin Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Total Users</h3>
        <p className="text-3xl font-bold text-white mt-2">1,245</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Active Subscriptions</h3>
        <p className="text-3xl font-bold text-white mt-2">892</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">System Health</h3>
        <p className="text-3xl font-bold text-green-400 mt-2">99.9%</p>
      </div>
    </div>
  </div>
);

const HRDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">HR Recruitment Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Open Positions</h3>
        <p className="text-3xl font-bold text-white mt-2">14</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Candidates in Pipeline</h3>
        <p className="text-3xl font-bold text-white mt-2">128</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Interviews Today</h3>
        <p className="text-3xl font-bold text-indigo-400 mt-2">6</p>
      </div>
    </div>
  </div>
);

const ManagerDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">Manager Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Team Members</h3>
        <p className="text-3xl font-bold text-white mt-2">12</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Pending Leaves</h3>
        <p className="text-3xl font-bold text-yellow-400 mt-2">3</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Avg Productivity Score</h3>
        <p className="text-3xl font-bold text-green-400 mt-2">92%</p>
      </div>
    </div>
  </div>
);

const EmployeeDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">Employee Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Leave Balance</h3>
        <p className="text-3xl font-bold text-white mt-2">14 Days</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">Next Holiday</h3>
        <p className="text-xl font-bold text-white mt-2">Thanksgiving (Nov 28)</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
        <h3 className="text-gray-400 font-medium">AI Chat Status</h3>
        <p className="text-xl font-bold text-indigo-400 mt-2">Online</p>
      </div>
    </div>
  </div>
);

const MainDashboard = () => {
  const user = useSelector(selectCurrentUser);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN': return <AdminDashboard />;
      case 'HR_RECRUITER': return <HRDashboard />;
      case 'SENIOR_MANAGER': return <ManagerDashboard />;
      case 'EMPLOYEE': return <EmployeeDashboard />;
      default: return <div>Loading...</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderDashboard()}
    </motion.div>
  );
};

export default MainDashboard;
