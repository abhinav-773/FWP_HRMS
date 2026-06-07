import React, { useEffect, useState } from 'react';
import axiosClient from '../../../services/axiosClient';
import ChecklistTracker from '../components/ChecklistTracker';
import { Mail, Phone, Calendar, User, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const OnboardingPortal = () => {
  const [checklist, setChecklist] = useState(null);
  const [assets, setAssets] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchOnboardingData = async () => {
    try {
      const res = await axiosClient.get('/onboarding/status');
      const payload = res.data?.data || res.data;
      
      if (!payload) {
        setEmployeeProfile(null);
        setChecklist(null);
        setAssets([]);
        return;
      }

      if (payload.user?.tempPassword) {
        setMustChangePassword(true);
      }

      setEmployeeProfile(payload.profile || null);
      
      // Handle the case where checklist is an array or a single object
      let currentChecklist = null;
      if (Array.isArray(payload.checklist)) {
        currentChecklist = payload.checklist[0] || null;
      } else if (payload.checklist) {
        currentChecklist = payload.checklist;
      }
      
      setChecklist(currentChecklist);
      setAssets(payload.assignedAssets || []);
    } catch (error) {
      console.error('fetchOnboardingData error:', error);
      // Fail silently for empty state instead of error toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await axiosClient.post('/onboarding/change-password', { newPassword });
      toast.success('Password changed successfully! Welcome!');
      setMustChangePassword(false);
    } catch (error) {
      toast.error('Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const timelineSteps = [
    { label: 'Offer Accepted', done: true },
    { label: 'Verification', done: checklist?.tasks?.filter(t => t.documentRequired).every(t => t.status === 'COMPLETED') },
    { label: 'IT Asset Setup', done: assets.length > 0 },
    { label: 'Orientation', done: checklist?.tasks?.some(t => t.title.toLowerCase().includes('orientation') && t.status === 'COMPLETED') },
    { label: 'Ready to Join', done: checklist?.status === 'COMPLETED' }
  ];

  if (!employeeProfile && !checklist && assets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center max-w-lg">
          <ShieldAlert className="w-16 h-16 text-indigo-500/50 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-3">Onboarding Not Initialized</h2>
          <p className="text-gray-400">Your onboarding profile has not been set up by HR yet. Please check back later or contact HR for assistance.</p>
        </div>
      </div>
    );
  }

  if (mustChangePassword) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-2">Welcome to HireMind!</h2>
        <p className="text-gray-400 text-sm mb-6">For your security, please set a new permanent password before accessing your onboarding portal.</p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={changingPassword}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
          >
            {changingPassword ? 'Updating...' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Panel */}
      <div className="relative bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Welcome to the Team! 👋
            </h1>
            <p className="text-indigo-200 mt-2 font-medium">
              We're excited to have you join us. Follow this portal to complete your onboarding process.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Join Date</span>
              <span className="text-sm font-black text-white">
                {employeeProfile?.joinDate ? new Date(employeeProfile.joinDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Joining Progress Tracker Timeline */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Joining Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 md:flex-col md:items-start relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step.done 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
                {step.done ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
              </div>
              <div className="md:mt-2">
                <p className={`font-bold text-sm ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                <p className="text-xs text-gray-500">{step.done ? 'Completed' : 'Pending'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Checklist Tracker */}
        <div className="lg:col-span-2">
          <ChecklistTracker checklist={checklist} onRefresh={fetchOnboardingData} />
        </div>

        {/* Right Col: IT Assets & Manager Contact Cards */}
        <div className="space-y-8">
          {/* Manager Info Card */}
          {employeeProfile?.manager && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-lg font-black text-white mb-4">Your Manager</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg text-lg">
                  {employeeProfile.manager.user?.fullName?.charAt(0) || 'M'}
                </div>
                <div>
                  <h4 className="font-bold text-white">{employeeProfile.manager.user?.fullName}</h4>
                  <p className="text-xs text-indigo-400">Reporting Manager</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{employeeProfile.manager.user?.email || 'manager@company.com'}</span>
                </div>
                {employeeProfile.manager.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{employeeProfile.manager.phone}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* IT Assets Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Assigned Assets</h3>
              <Cpu className="h-5 w-5 text-indigo-400" />
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <ShieldAlert className="h-8 w-8 text-indigo-400/60 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">No Assets Assigned Yet</p>
                <p className="text-xs text-gray-400 mt-1">HR will assign assets once NDA verification is complete.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{asset.assetName}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{asset.assetType}</p>
                    </div>
                    {asset.serialNumber && (
                      <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-md text-gray-400 border border-white/5 font-mono">
                        {asset.serialNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPortal;
