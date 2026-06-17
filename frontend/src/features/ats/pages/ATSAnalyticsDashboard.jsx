import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LineChart, Line, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Users, Target, Activity, Code, MapPin } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const ATSAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axiosClient.get('/ats/metrics');
        setMetrics(res.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { funnel, aiInsights } = metrics;
  
  // Aggregate Counts for Top Row
  const appsCount = funnel?.APPLIED || 0;
  const shortCount = funnel?.SHORTLISTED || 0;
  const rejectCount = funnel?.REJECTED || 0;
  const interviewCount = funnel?.INTERVIEW || 0;
  const hiredCount = funnel?.HIRED || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Advanced ATS Analytics</h2>
        <p className="text-gray-400 mt-1">Deep insights into hiring trends, candidate sources, and skill gaps.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: 'Applications', count: appsCount, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { title: 'Shortlisted', count: shortCount, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
          { title: 'Interviews', count: interviewCount, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
          { title: 'Hired', count: hiredCount, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { title: 'Rejected', count: rejectCount, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        ].map((kpi, idx) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} 
            className={`p-4 rounded-xl border ${kpi.border} ${kpi.bg} backdrop-blur-sm flex flex-col items-center justify-center text-center`}>
            <p className="text-gray-400 text-sm font-medium">{kpi.title}</p>
            <p className={`text-3xl font-black mt-2 ${kpi.color}`}>{kpi.count}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Trends (Line Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-indigo-400" /> Hiring Trends (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiInsights?.hiringTrends || []} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Best Performing Sources (Pie Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center"><Target className="mr-2 h-5 w-5 text-pink-400" /> Best Performing Sources</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={aiInsights?.bestPerformingSources || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {(aiInsights?.bestPerformingSources || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Candidate Skills (Bar Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center"><Code className="mr-2 h-5 w-5 text-green-400" /> Top Candidate Skills</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiInsights?.topSkills || []} margin={{ top: 20, right: 30, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} width={100} />
                <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {(aiInsights?.topSkills || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ATSAnalyticsDashboard;
