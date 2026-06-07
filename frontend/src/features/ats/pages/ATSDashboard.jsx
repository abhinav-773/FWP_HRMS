import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Calendar, TrendingUp, ChevronRight, Activity, Award, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, PieChart, Pie } from 'recharts';
import axiosClient from '../../../services/axiosClient';
import AIPipelineVisualizer from '../../../components/ai/AIPipelineVisualizer';

const ATSDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axiosClient.get('/ats/metrics');
        setMetrics(res.data.data);
      } catch (error) {
        console.error(error);
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

  const funnelData = [
    { name: 'Applied', value: metrics.funnel?.APPLIED || 0, color: '#6366f1' },
    { name: 'Screening', value: metrics.funnel?.SCREENING || 0, color: '#8b5cf6' },
    { name: 'Interview', value: metrics.funnel?.INTERVIEW || 0, color: '#d946ef' },
    { name: 'Shortlisted', value: metrics.funnel?.SHORTLISTED || 0, color: '#ec4899' },
    { name: 'Hired', value: metrics.funnel?.HIRED || 0, color: '#10b981' },
  ];

  const scoreData = metrics.scoreDistribution || [
    { range: '0-20', count: 0 },
    { range: '21-40', count: 0 },
    { range: '41-60', count: 0 },
    { range: '61-80', count: 0 },
    { range: '81-100', count: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Recruitment Analytics</h2>
          <p className="text-gray-400 mt-1">Real-time insights into your hiring pipeline and AI evaluations.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-semibold hover:bg-indigo-500/20 transition-colors">
          Download Report
        </button>
      </div>

      {/* AI Pipeline Visualizer */}
      <AIPipelineVisualizer />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Briefcase className="w-24 h-24 text-indigo-400" /></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-gray-400 font-medium">Active Jobs</h3>
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Briefcase className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-black text-white mt-4 relative z-10">{metrics.activeJobs}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users className="w-24 h-24 text-purple-400" /></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-gray-400 font-medium">Total Candidates</h3>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Users className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-black text-white mt-4 relative z-10">{metrics.totalCandidates}</p>
        </motion.div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar className="w-24 h-24 text-pink-400" /></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-gray-400 font-medium">Upcoming Interviews</h3>
            <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg"><Calendar className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-black text-white mt-4 relative z-10">{metrics.upcomingInterviews?.length || 0}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp className="w-24 h-24 text-green-400" /></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-gray-400 font-medium">Hired</h3>
            <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <p className="text-4xl font-black text-white mt-4 relative z-10">{metrics.funnel?.HIRED || 0}</p>
        </motion.div>
      </div>

      {/* Middle Row: Funnel & AI Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center"><Activity className="mr-2 h-5 w-5 text-indigo-400" /> Candidate Funnel</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center"><Star className="mr-2 h-5 w-5 text-purple-400" /> AI Score Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="range" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#a855f7" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Leaderboard & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center"><Award className="mr-2 h-5 w-5 text-yellow-400" /> Top AI Candidates</h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">Highest Scored</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/20 text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">AI Score</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.leaderboard && metrics.leaderboard.length > 0 ? metrics.leaderboard.map((app, index) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs mr-3 shadow-lg shadow-indigo-500/20">
                          {app.candidate?.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-white">{app.candidate?.fullName}</div>
                          <div className="text-xs text-gray-500">{app.candidate?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium">{app.job?.title}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 font-bold text-sm">
                        {Math.round(app.aiScore)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-400 hover:text-indigo-300 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        View Profile &rarr;
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No scored candidates yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-2">
            {metrics.activityFeed && metrics.activityFeed.length > 0 ? (
              metrics.activityFeed.map((activity, index) => (
                <div key={activity.id} className="relative pl-6">
                  {/* Timeline line */}
                  {index !== metrics.activityFeed.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-[-20px] w-px bg-gray-700"></div>
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-gray-900"></div>
                  
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-white">{activity.performedBy?.fullName}</span> moved <span className="font-bold text-indigo-400">{activity.application?.candidate?.fullName}</span> to <span className="font-medium text-purple-400">{activity.toStage}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center mt-10">No recent activity.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ATSDashboard;
