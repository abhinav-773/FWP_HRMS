import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const EnterpriseLoginModal = ({ role, isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Reset state when modal opens for a new role
  useEffect(() => {
    if (isOpen) {
      setIdentifier('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen, role]);

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/custom-auth/login', { 
        emailOrEmployeeId: identifier, 
        password, 
        role: role.id 
      });
      
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success('Authentication successful');

      onClose();

      if (data.user.tempPassword) {
        navigate('/change-password');
      } else {
        const userRole = data.user.role;
        if (userRole === 'SUPER_ADMIN') {
          navigate('/admin/dashboard');
        } else if (userRole === 'HR_RECRUITER') {
          navigate('/dashboard');
        } else if (userRole === 'SENIOR_MANAGER') {
          navigate('/manager/dashboard');
        } else if (userRole === 'EMPLOYEE') {
          navigate('/employee/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid credentials or unauthorized role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    if (!role) return '';
    if (role.id === 'HR_RECRUITER') return 'Sign in to your recruiter account';
    if (role.id === 'SENIOR_MANAGER') return 'Sign in to your manager account';
    if (role.id === 'SUPER_ADMIN') return 'Sign in to your admin account';
    return `Sign in to your ${role.title.toLowerCase()} account`;
  };

  return (
    <AnimatePresence>
      {isOpen && role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden bg-white dark:bg-[#0f111a] border border-gray-200 dark:border-[#1f2233] shadow-2xl rounded-2xl transition-colors duration-300"
          >
            {/* Top gradient line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#7c3aed] to-[#db2777]" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pb-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-[#a855f7] dark:to-[#ec4899] tracking-wide mb-1">
                  HireMind
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-[13px] font-medium">
                  Sign in to your enterprise account
                </p>
              </div>

              {/* Card Content */}
              <div className="bg-gray-50 dark:bg-[#212136] border border-gray-200 dark:border-[#3c365c] rounded-xl p-6 shadow-inner relative z-10 transition-colors duration-300">
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white mb-6 text-center relative z-10">
                  {getRoleTitle()}
                </h2>

                <form onSubmit={handleCustomLogin} className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMAIL OR ID</label>
                    <div className="relative group/input">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b5cf6]" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#13111f] border border-indigo-500 dark:border-[#7c3aed] text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-[#4b4b61] rounded-lg focus:ring-1 focus:ring-indigo-500 dark:focus:ring-[#7c3aed] outline-none transition-all duration-300 text-sm shadow-sm"
                        placeholder="Enter email or ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PASSWORD</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-[#13111f] border border-gray-300 dark:border-[#322f46] text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-[#4b4b61] rounded-lg focus:border-indigo-500 dark:focus:border-[#7c3aed] outline-none transition-all duration-300 text-sm tracking-widest shadow-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white font-bold rounded-lg shadow-[0_4px_20px_-5px_rgba(147,51,234,0.5)] disabled:opacity-70 flex items-center justify-center gap-2 transition-all mt-6 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-[9px] text-[#4b4b61] font-bold tracking-[0.2em] uppercase">
                  Powered by HireMind
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EnterpriseLoginModal;
