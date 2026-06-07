import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../../services/axiosClient';
import { selectCurrentUser, setCredentials, selectAccessToken } from '../../../store/slices/authSlice';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAccessToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }

    setLoading(true);
    try {
      await axiosClient.post('/custom-auth/change-password', { newPassword });
      toast.success('Password changed successfully!');
      
      // Update local state to reflect that temp password is false
      if (user) {
        dispatch(setCredentials({ 
          user: { ...user, tempPassword: false }, 
          accessToken: token 
        }));
      }

      // Redirect to portal based on role
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Secure Your Account</h2>
        <p className="text-gray-400 text-center mb-8">
          You must change your temporary password before accessing the portal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="At least 8 characters"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Match your new password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all mt-6"
          >
            {loading ? 'Updating...' : 'Save & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
