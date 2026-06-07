import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, Zap, DollarSign, BrainCircuit, Activity } from 'lucide-react';

const aiImpactData = [
  { name: 'Jan', manual: 400, ai: 240, savings: 160 },
  { name: 'Feb', manual: 300, ai: 139, savings: 161 },
  { name: 'Mar', manual: 200, ai: 98, savings: 102 },
  { name: 'Apr', manual: 278, ai: 39, savings: 239 },
  { name: 'May', manual: 189, ai: 48, savings: 141 },
  { name: 'Jun', manual: 239, ai: 38, savings: 201 },
];

const productivityData = [
  { name: 'Engineering', value: 92 },
  { name: 'Sales', value: 85 },
  { name: 'Marketing', value: 78 },
  { name: 'Product', value: 88 },
  { name: 'HR', value: 95 },
];

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150" />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <span className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </span>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
        <Icon className="h-6 w-6 text-indigo-400" />
      </div>
    </div>
  </motion.div>
);

const ExecutiveDashboard = () => {
  return (
    <div className="space-y-8 executive-dashboard">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Executive Overview</h1>
          <p className="text-gray-400">High-level metrics and AI automation impact analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-medium border border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Live Data
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Employees" value="1,248" change="+12% YoY" icon={Users} trend="up" />
        <MetricCard title="AI Cost Savings" value="$2.4M" change="+$450k MTD" icon={DollarSign} trend="up" />
        <MetricCard title="Time-to-Hire" value="14 Days" change="-45% with AI" icon={Zap} trend="up" />
        <MetricCard title="Workforce Efficiency" value="94.2%" change="+2.4% QTD" icon={Activity} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-gray-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 ai-impact-chart"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-indigo-400" />
                AI Automation Impact (Hours)
              </h3>
              <p className="text-sm text-gray-400">Manual hours vs AI-automated hours</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiImpactData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="manual" stroke="#9ca3af" fillOpacity={1} fill="url(#colorManual)" />
                <Area type="monotone" dataKey="ai" stroke="#a78bfa" fillOpacity={1} fill="url(#colorAi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-1">Department Productivity</h3>
          <p className="text-sm text-gray-400 mb-6">AI-assisted output scores</p>
          
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productivityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">88%</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Avg Score</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {productivityData.map((dept, idx) => (
              <div key={dept.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-xs text-gray-300">{dept.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
