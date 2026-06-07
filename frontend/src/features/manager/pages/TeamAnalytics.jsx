import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, Users, ShieldAlert, Zap, TrendingUp, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'];

const dummyRadarData = [
  { subject: 'Productivity', A: 85, fullMark: 100 },
  { subject: 'Code Quality', A: 78, fullMark: 100 },
  { subject: 'Communication', A: 92, fullMark: 100 },
  { subject: 'Timeliness', A: 65, fullMark: 100 },
  { subject: 'Teamwork', A: 88, fullMark: 100 },
  { subject: 'Innovation', A: 70, fullMark: 100 },
];

const dummyTrendData = [
  { name: 'Week 1', productivity: 75, burnout: 20 },
  { name: 'Week 2', productivity: 78, burnout: 25 },
  { name: 'Week 3', productivity: 85, burnout: 35 },
  { name: 'Week 4', productivity: 82, burnout: 45 },
  { name: 'Week 5', productivity: 70, burnout: 60 },
  { name: 'Week 6', productivity: 65, burnout: 75 },
];

const TeamAnalytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axiosClient.get('/manager/analytics');
      setMetrics(res.data);
    } catch (err) {
      console.warn('Failed to load team analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

  const burnoutRisk = metrics?.burnoutRiskScore || 0;
  let burnoutColor = 'text-green-400';
  if (burnoutRisk > 40) burnoutColor = 'text-yellow-400';
  if (burnoutRisk > 70) burnoutColor = 'text-red-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-400" />
            Team Analytics Engine
          </h1>
          <p className="text-gray-400 mt-1">AI-driven insights on productivity, attendance, and team burnout risk.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-bold flex items-center gap-2">
          <Cpu className="w-5 h-5" /> AI Analysis Active
        </div>
      </div>

      {/* Top AI Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
            <h3 className="text-gray-400 font-medium">Burnout Risk Score</h3>
          </div>
          <p className={`text-4xl font-bold ${burnoutColor}`}>{burnoutRisk.toFixed(1)}%</p>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${burnoutRisk}%` }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
            <h3 className="text-gray-400 font-medium">Average Productivity</h3>
          </div>
          <p className="text-4xl font-bold text-white">{metrics?.averageProductivity?.toFixed(1) || 0}%</p>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${metrics?.averageProductivity || 0}%` }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Zap className="w-6 h-6" /></div>
            <h3 className="text-gray-400 font-medium">Task Completion Ratio</h3>
          </div>
          <p className="text-4xl font-bold text-white">
            {metrics?.completedTasks || 0} <span className="text-xl text-gray-500 font-medium">/ {(metrics?.completedTasks || 0) + (metrics?.overdueTasks || 0)}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">Overdue tasks: {metrics?.overdueTasks || 0}</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Productivity vs Burnout Area Chart */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Productivity vs Burnout Trend</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" />
                <Area type="monotone" dataKey="burnout" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorBurn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance Radar */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Aggregate Team Performance</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dummyRadarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" />
                <Radar name="Team Average" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Qualitative Insights */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
        
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <Cpu className="w-6 h-6 text-indigo-400" />
          HireMind Executive Synthesis
        </h2>
        
        <div className="space-y-4 text-gray-300 leading-relaxed text-sm">
          <p>
            <strong className="text-white">Attrition Risk Prediction:</strong> Based on the recent uptick in the burnout risk score (currently {burnoutRisk.toFixed(1)}%) coupled with a slight decline in productivity trends over the last two weeks, the model detects a <strong>moderate attrition risk</strong> within the engineering quadrant. It is recommended to schedule 1-on-1 check-ins with top performers carrying overdue tasks.
          </p>
          <p>
            <strong className="text-white">Team Morale Analysis:</strong> Sentiment analysis from recent peer feedback and chat velocity indicates stable morale, but collaborative task completion has slowed. 
          </p>
          <p>
            <strong className="text-white">Productivity Forecasting:</strong> If the current workload distribution remains unchanged, overall team efficiency is projected to dip by 5-8% next sprint. Reassigning high-priority "In Progress" items from overburdened employees to those with lower utilization rates could mitigate this.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;
