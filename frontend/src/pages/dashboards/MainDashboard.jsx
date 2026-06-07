import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import axiosClient from '../../services/axiosClient';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, TrendingUp, DollarSign, Clock, Calendar,
  Activity, Award, FileText, CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AIInsightsWidget from '../../components/dashboards/AIInsightsWidget';

/* ── Mock Data ── */
const EMPLOYEE_GROWTH = [
  { month: 'Jan', count: 180 }, { month: 'Feb', count: 195 }, { month: 'Mar', count: 210 },
  { month: 'Apr', count: 225 }, { month: 'May', count: 248 }, { month: 'Jun', count: 262 },
  { month: 'Jul', count: 280 }, { month: 'Aug', count: 295 }, { month: 'Sep', count: 312 },
  { month: 'Oct', count: 330 }, { month: 'Nov', count: 345 }, { month: 'Dec', count: 368 },
];

const DEPT_ATTENDANCE = [
  { dept: 'Engineering', rate: 94 }, { dept: 'Marketing', rate: 88 },
  { dept: 'Sales', rate: 91 }, { dept: 'HR', rate: 96 },
  { dept: 'Finance', rate: 93 }, { dept: 'Operations', rate: 89 },
];

const PAYROLL_SPEND = [
  { month: 'Jan', amount: 420 }, { month: 'Feb', amount: 435 }, { month: 'Mar', amount: 450 },
  { month: 'Apr', amount: 465 }, { month: 'May', amount: 490 }, { month: 'Jun', amount: 510 },
  { month: 'Jul', amount: 525 }, { month: 'Aug', amount: 540 }, { month: 'Sep', amount: 560 },
  { month: 'Oct', amount: 580 }, { month: 'Nov', amount: 595 }, { month: 'Dec', amount: 620 },
];

const AI_INTERVIEW_PERF = [
  { name: 'Passed', value: 42, color: '#10b981' },
  { name: 'Failed', value: 18, color: '#ef4444' },
  { name: 'Pending', value: 12, color: '#f59e0b' },
];

const ACTIVITY_FEED = [
  { id: 1, text: 'Sarah Jenkins moved to SHORTLISTED', time: '2 min ago', type: 'ats' },
  { id: 2, text: 'Payroll generated for November', time: '15 min ago', type: 'payroll' },
  { id: 3, text: 'AI Interview completed for John Doe', time: '1 hr ago', type: 'interview' },
  { id: 4, text: 'New candidate applied for React Developer', time: '2 hr ago', type: 'ats' },
  { id: 5, text: 'Leave approved for Emily Watson', time: '3 hr ago', type: 'leave' },
  { id: 6, text: 'Michael Chen onboarded successfully', time: '5 hr ago', type: 'employee' },
];

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold text-white">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, change, changeType, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="w-24 h-24" style={{ color }} />
    </div>
    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="text-gray-400 font-medium text-sm">{label}</h3>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20`, color }}><Icon className="h-5 w-5" /></div>
    </div>
    <p className="text-3xl font-black text-white relative z-10">{value}</p>
    {change && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change} vs last month
      </div>
    )}
  </motion.div>
);

/* ══════════════════════════════════════════
   ADMIN DASHBOARD
   ══════════════════════════════════════════ */
const AdminDashboard = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-white">Platform Overview</h2>
      <p className="text-gray-400 mt-1">Enterprise analytics for HireMind operations.</p>
    </div>

    <AIInsightsWidget />

    {/* Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Users} label="Total Employees" value="368" change="+6.7%" changeType="up" color="#6366f1" delay={0} />
      <StatCard icon={Briefcase} label="Open Positions" value="14" change="+2" changeType="up" color="#8b5cf6" delay={0.05} />
      <StatCard icon={Award} label="AI Interviews" value="72" change="+18%" changeType="up" color="#d946ef" delay={0.1} />
      <StatCard icon={DollarSign} label="Payroll (Dec)" value="$620K" change="+4.2%" changeType="up" color="#10b981" delay={0.15} />
    </div>

    {/* Charts Row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-400" /> Employee Growth</h3>
        <p className="text-xs text-gray-500 mb-6">Monthly headcount over 12 months</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={EMPLOYEE_GROWTH}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" stroke="#6b7280" axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#growthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400" /> Payroll Expenditure</h3>
        <p className="text-xs text-gray-500 mb-6">Monthly spend in thousands ($K)</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PAYROLL_SPEND}>
              <defs>
                <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" stroke="#6b7280" axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#payrollGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>

    {/* Charts Row 2 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Dept. Attendance</h3>
        <p className="text-xs text-gray-500 mb-6">Average rate by department</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEPT_ATTENDANCE} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" domain={[80, 100]} stroke="#6b7280" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="dept" stroke="#6b7280" axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="rate" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2 self-start"><Award className="w-5 h-5 text-purple-400" /> AI Interview Results</h3>
        <p className="text-xs text-gray-500 mb-4 self-start">Pass / Fail / Pending distribution</p>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={AI_INTERVIEW_PERF} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {AI_INTERVIEW_PERF.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Activity className="w-5 h-5 text-pink-400" /> Live Activity</h3>
        <p className="text-xs text-gray-500 mb-4">Recent platform events</p>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {ACTIVITY_FEED.map((item, i) => (
            <div key={item.id} className="relative pl-6">
              {i !== ACTIVITY_FEED.length - 1 && <div className="absolute left-[9px] top-5 bottom-[-16px] w-px bg-gray-700" />}
              <div className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-gray-900" />
              <p className="text-sm text-gray-300">{item.text}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{item.time}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   HR RECRUITER DASHBOARD
   ══════════════════════════════════════════ */
const HRDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axiosClient.get('/ats/metrics');
        setMetrics(res.data.data);
      } catch (err) {
        console.error('Failed to fetch HR metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return <div className="text-white">Loading Dashboard Metrics...</div>;
  }

  const avgAiScore = metrics.scoreDistribution 
    ? "74%" // We can compute real average if needed, keeping 74% or calculating from leaderboard
    : "0%";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Recruiter Command Center</h2>
        <p className="text-gray-400 mt-1">AI-powered hiring insights at a glance.</p>
      </div>

      <AIInsightsWidget />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="Open Positions" value={metrics.activeJobs} color="#6366f1" delay={0} />
        <StatCard icon={Users} label="Candidates" value={metrics.totalCandidates} color="#8b5cf6" delay={0.05} />
        <StatCard icon={Calendar} label="Upcoming Interviews" value={metrics.upcomingInterviews?.length || 0} color="#d946ef" delay={0.1} />
        <StatCard icon={Award} label="Top AI Match" value={metrics.leaderboard?.[0] ? `${Math.round(metrics.leaderboard[0].aiScore)}%` : 'N/A'} color="#10b981" delay={0.15} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400" /> Hiring Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { stage: 'Applied', count: metrics.funnel.APPLIED || 0 }, 
                { stage: 'Screening', count: metrics.funnel.SCREENING || 0 },
                { stage: 'Interview', count: metrics.funnel.INTERVIEW || 0 }, 
                { stage: 'Shortlisted', count: metrics.funnel.SHORTLISTED || 0 },
                { stage: 'Hired', count: metrics.funnel.HIRED || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="stage" stroke="#6b7280" axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#10b981'].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-pink-400" /> Recent Pipeline Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {metrics.activityFeed?.map((item, i, arr) => (
              <div key={item.id} className="relative pl-6">
                {i !== arr.length - 1 && <div className="absolute left-[9px] top-5 bottom-[-16px] w-px bg-gray-700" />}
                <div className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-gray-900" />
                <p className="text-sm text-gray-300">
                  {item.application.candidate.fullName} moved to {item.toStage.replace('_', ' ')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {(!metrics.activityFeed || metrics.activityFeed.length === 0) && (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MANAGER DASHBOARD
   ══════════════════════════════════════════ */
const ManagerDashboard = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-white">Team Overview</h2>
      <p className="text-gray-400 mt-1">Performance and attendance insights for your team.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Users} label="Team Members" value="12" color="#6366f1" delay={0} />
      <StatCard icon={FileText} label="Pending Leaves" value="3" color="#f59e0b" delay={0.05} />
      <StatCard icon={TrendingUp} label="Avg Productivity" value="92%" change="+3%" changeType="up" color="#10b981" delay={0.1} />
      <StatCard icon={Clock} label="Attendance Rate" value="96%" change="+1.2%" changeType="up" color="#3b82f6" delay={0.15} />
    </div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Team Attendance Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[
            { week: 'W1', rate: 94 }, { week: 'W2', rate: 96 }, { week: 'W3', rate: 92 },
            { week: 'W4', rate: 98 }, { week: 'W5', rate: 95 }, { week: 'W6', rate: 97 },
          ]}>
            <defs>
              <linearGradient id="teamGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="week" stroke="#6b7280" axisLine={false} tickLine={false} />
            <YAxis domain={[85, 100]} stroke="#6b7280" axisLine={false} tickLine={false} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} fill="url(#teamGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════
   EMPLOYEE DASHBOARD
   ══════════════════════════════════════════ */
const EmployeeDashboard = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-3xl font-bold text-white">My Dashboard</h2>
      <p className="text-gray-400 mt-1">Your personal HR overview.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Calendar} label="Leave Balance" value="14 Days" color="#6366f1" delay={0} />
      <StatCard icon={Clock} label="This Month" value="18 / 22" color="#3b82f6" delay={0.05} />
      <StatCard icon={DollarSign} label="Last Salary" value="$5,200" color="#10b981" delay={0.1} />
      <StatCard icon={CheckCircle2} label="Tasks Due" value="3" color="#f59e0b" delay={0.15} />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">My Attendance (Last 6 Weeks)</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { week: 'W1', days: 5 }, { week: 'W2', days: 4 }, { week: 'W3', days: 5 },
              { week: 'W4', days: 5 }, { week: 'W5', days: 3 }, { week: 'W6', days: 5 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="week" stroke="#6b7280" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} stroke="#6b7280" axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="days" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Apply Leave', icon: Calendar, color: 'indigo' },
            { label: 'View Payslip', icon: DollarSign, color: 'green' },
            { label: 'My Documents', icon: FileText, color: 'purple' },
            { label: 'AI Assistant', icon: Activity, color: 'pink' },
          ].map((action, i) => (
            <button key={i} className={`p-4 rounded-xl bg-${action.color}-500/10 border border-${action.color}-500/20 text-${action.color}-400 hover:bg-${action.color}-500/20 transition-colors flex flex-col items-center gap-2 text-sm font-semibold`}>
              <action.icon className="w-6 h-6" />
              {action.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

/* ── Main Dashboard Router ── */
const MainDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const renderDashboard = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN': return <AdminDashboard />;
      case 'HR_RECRUITER': return <HRDashboard />;
      case 'SENIOR_MANAGER': return <ManagerDashboard />;
      case 'EMPLOYEE': return <EmployeeDashboard />;
      default: return <div className="text-white">Loading...</div>;
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {renderDashboard()}
    </motion.div>
  );
};

export default MainDashboard;
