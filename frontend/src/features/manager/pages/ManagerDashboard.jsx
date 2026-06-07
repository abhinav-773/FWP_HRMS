import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, FileText, CheckCircle, Activity, ChevronRight, Award, TrendingUp } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MetricCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-20 group-hover:scale-150 transition-transform duration-500`} />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </motion.div>
);

const ManagerDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    activeTasks: 0,
    pendingLeaves: 0,
    productivity: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        axiosClient.get('/manager/dashboard'),
        axiosClient.get('/manager/analytics')
      ]);
      setMetrics({
        totalMembers: dashRes.data.totalMembers || 0,
        activeTasks: dashRes.data.activeTasks || 0,
        pendingLeaves: dashRes.data.pendingLeaves || 0,
        productivity: Math.round(analyticsRes.data.averageProductivity || 0)
      });
    } catch (error) {
      console.warn('Dashboard metrics empty or failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Team Overview</h1>
        <p className="text-gray-400 mt-1">Monitor daily operations and team health.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Team Members"
          value={metrics.totalMembers}
          icon={Users}
          color="bg-blue-500"
          delay={0.1}
        />
        <MetricCard
          title="Team Productivity"
          value={`${metrics.productivity}%`}
          icon={TrendingUp}
          color="bg-green-500"
          delay={0.2}
        />
        <MetricCard
          title="Active Tasks"
          value={metrics.activeTasks}
          icon={CheckCircle}
          color="bg-indigo-500"
          delay={0.3}
        />
        <MetricCard
          title="Pending Leaves"
          value={metrics.pendingLeaves}
          icon={FileText}
          color="bg-orange-500"
          delay={0.4}
        />
      </div>

      {/* Action Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/manager/tasks" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-white">Assign Task</h4>
                  <p className="text-xs text-gray-400">Delegate a new task to team</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <Link to="/manager/approvals" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg"><FileText className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-white">Approve Leaves</h4>
                  <p className="text-xs text-gray-400">Review pending requests</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <Link to="/manager/reviews" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Award className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-white">Performance Reviews</h4>
                  <p className="text-xs text-gray-400">Evaluate team members</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </motion.div>

        {/* AI Insights & Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 lg:col-span-2 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">AI Team Insights</h2>
            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold flex items-center gap-2">
              <Activity className="w-3 h-3" /> Live Analysis
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl mb-6">
            <h3 className="font-semibold text-indigo-300 mb-2">Weekly Summary</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your team is currently operating at a <strong className="text-green-400">{metrics.productivity}%</strong> productivity efficiency. 
              {metrics.activeTasks > 5 ? ' Task volume is high, consider re-allocating resources to prevent burnout.' : ' Workload is balanced.'} 
              {metrics.pendingLeaves > 0 && ` There are ${metrics.pendingLeaves} pending leave requests requiring your attention.`}
            </p>
          </div>

          {/* Placeholder for real-time feed or upcoming interviews */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Upcoming Technical Interviews</h3>
            <div className="flex items-center justify-center p-8 border border-dashed border-gray-700 rounded-xl text-gray-500">
              No technical interviews scheduled for your department today.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
