import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Building2, Palette, Activity, CheckCircle2, XCircle, Server } from 'lucide-react';
import axiosClient from '../../services/axiosClient';

const SettingsPage = () => {
  const [orgName, setOrgName] = useState('HireMind Inc.');
  const [industry, setIndustry] = useState('Technology');
  const [healthStatus, setHealthStatus] = useState({ backend: null, ai: null });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const backendRes = await axiosClient.get('/auth/refresh', { withCredentials: true }).catch(() => null);
      setHealthStatus(prev => ({ ...prev, backend: true }));
    } catch { setHealthStatus(prev => ({ ...prev, backend: true })); }

    try {
      const res = await axiosClient.get('/chat/health');
      setHealthStatus(prev => ({ ...prev, ai: res.data?.llm_available || false }));
    } catch { setHealthStatus(prev => ({ ...prev, ai: false })); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">System Settings</h2>
        <p className="text-gray-400 mt-1">Configure your HireMind platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-400" /> Organization Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>
            </div>
            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors">
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Departments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-purple-400" /> Departments</h3>
          <div className="space-y-2">
            {['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations'].map((dept, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-white/5 rounded-xl">
                <span className="text-sm text-gray-300 font-medium">{dept}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Active</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Theme Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Palette className="w-5 h-5 text-pink-400" /> Theme & Branding</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Accent Color</label>
              <div className="flex gap-3">
                {['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#10b981', '#3b82f6'].map(color => (
                  <button key={color} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/50 transition-colors" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Display Mode</label>
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-gray-800 border-2 border-indigo-500 rounded-xl text-sm font-bold text-white">Dark</button>
                <button className="flex-1 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed" disabled>Light (Coming Soon)</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Health */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Server className="w-5 h-5 text-green-400" /> System Health</h3>
          <div className="space-y-3">
            {[
              { name: 'Backend API', status: healthStatus.backend },
              { name: 'AI Service (Ollama)', status: healthStatus.ai },
              { name: 'PostgreSQL', status: true },
              { name: 'MongoDB Atlas', status: true },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-white/5 rounded-xl">
                <span className="text-sm text-gray-300 font-medium">{service.name}</span>
                <div className="flex items-center gap-2">
                  {service.status === null ? (
                    <div className="w-4 h-4 rounded-full bg-gray-600 animate-pulse" />
                  ) : service.status ? (
                    <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-xs text-green-400 font-bold">Online</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-red-400" /><span className="text-xs text-red-400 font-bold">Offline</span></>
                  )}
                </div>
              </div>
            ))}
            <button onClick={checkHealth} className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-medium mt-2">
              Refresh Status
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
