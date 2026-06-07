import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles, UserPlus } from 'lucide-react';

const MOCK_INSIGHTS = [
  {
    id: 1,
    type: 'warning',
    title: 'Burnout Risk Detected',
    message: '3 engineers in the Platform team have worked >50 hours this week.',
    icon: AlertTriangle,
    color: 'text-red-400 bg-red-500/20 border-red-500/30'
  },
  {
    id: 2,
    type: 'opportunity',
    title: 'Top Candidate Recommended',
    message: 'AI scored Jane Doe 94% for the Senior React Developer role.',
    icon: Sparkles,
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30'
  },
  {
    id: 3,
    type: 'trend',
    title: 'Attendance Trending Up',
    message: 'Overall attendance improved by 4.2% compared to last month.',
    icon: TrendingUp,
    color: 'text-green-400 bg-green-500/20 border-green-500/30'
  },
  {
    id: 4,
    type: 'action',
    title: 'Interviews Pending',
    message: 'You have 5 candidates in SCREENING waiting for an interview schedule.',
    icon: UserPlus,
    color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30'
  }
];

const AIInsightsWidget = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Lightbulb className="w-32 h-32 text-indigo-400" />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Proactive AI Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_INSIGHTS.map(insight => (
            <div 
              key={insight.id} 
              className={`p-4 rounded-xl border ${insight.color} backdrop-blur-sm transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-black/20">
                  <insight.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{insight.title}</h4>
                  <p className="text-xs text-white/70 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsightsWidget;
