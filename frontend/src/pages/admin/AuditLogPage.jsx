import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Filter, User, Clock, FileText, Briefcase, DollarSign, LogIn } from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  { id: 1, action: 'USER_LOGIN', user: 'admin@hrgpt.ai', details: 'Logged in from 192.168.1.1', timestamp: '2026-06-03T16:30:00Z', type: 'auth' },
  { id: 2, action: 'CANDIDATE_STAGE_CHANGE', user: 'recruiter@hrgpt.ai', details: 'Moved Sarah Jenkins from SCREENING to INTERVIEW', timestamp: '2026-06-03T16:15:00Z', type: 'ats' },
  { id: 3, action: 'PAYROLL_GENERATED', user: 'admin@hrgpt.ai', details: 'Payroll batch generated for November 2026', timestamp: '2026-06-03T15:45:00Z', type: 'payroll' },
  { id: 4, action: 'AI_INTERVIEW_COMPLETED', user: 'system', details: 'AI Interview completed for John Doe — Score: 84%', timestamp: '2026-06-03T15:00:00Z', type: 'interview' },
  { id: 5, action: 'DOCUMENT_UPLOADED', user: 'employee@hrgpt.ai', details: 'Uploaded "Tax_Form_W2.pdf"', timestamp: '2026-06-03T14:30:00Z', type: 'document' },
  { id: 6, action: 'LEAVE_APPROVED', user: 'manager@hrgpt.ai', details: 'Approved leave for Emily Watson (Dec 20-24)', timestamp: '2026-06-03T14:00:00Z', type: 'leave' },
  { id: 7, action: 'USER_REGISTERED', user: 'system', details: 'New user john.doe@company.com registered as EMPLOYEE', timestamp: '2026-06-03T13:30:00Z', type: 'auth' },
  { id: 8, action: 'JOB_CREATED', user: 'recruiter@hrgpt.ai', details: 'Created job posting: Senior React Developer', timestamp: '2026-06-03T12:00:00Z', type: 'ats' },
];

const TYPE_CONFIG = {
  auth: { icon: LogIn, color: 'text-blue-400 bg-blue-500/20' },
  ats: { icon: Briefcase, color: 'text-purple-400 bg-purple-500/20' },
  payroll: { icon: DollarSign, color: 'text-green-400 bg-green-500/20' },
  interview: { icon: User, color: 'text-pink-400 bg-pink-500/20' },
  document: { icon: FileText, color: 'text-indigo-400 bg-indigo-500/20' },
  leave: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/20' },
};

const AuditLogPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_AUDIT_LOGS.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false;
    if (searchQuery && !log.details.toLowerCase().includes(searchQuery.toLowerCase()) && !log.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Shield className="w-8 h-8 text-indigo-400" /> Audit Logs</h2>
        <p className="text-gray-400 mt-1">Enterprise activity monitoring and compliance tracking.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'auth', 'ats', 'payroll', 'interview', 'document', 'leave'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === f ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-gray-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(log => {
              const config = TYPE_CONFIG[log.type] || TYPE_CONFIG.auth;
              const Icon = config.icon;
              return (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs text-gray-300">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{log.user}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm max-w-xs truncate">{log.details}</td>
                  <td className="px-6 py-4 text-right text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  No matching audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AuditLogPage;
