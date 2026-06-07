import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Briefcase, Building, Key, CheckCircle, Loader } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';

const AddEmployeeModal = ({ isOpen, onClose, onSuccess, existingEmployees }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'EMPLOYEE',
    departmentId: '',
    designationId: '',
    managerId: '',
    joinDate: new Date().toISOString().split('T')[0],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Extract unique departments & designations from existing employees for dropdowns
  const departments = [...new Map(existingEmployees.filter(e => e.department).map(e => [e.department.id, e.department])).values()];
  const designations = [...new Map(existingEmployees.filter(e => e.designation).map(e => [e.designation.id, e.designation])).values()];
  const managers = existingEmployees.filter(e => ['SENIOR_MANAGER', 'SUPER_ADMIN'].includes(e.user?.role));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axiosClient.post('/employees', formData);
      setSuccessData({
        employeeId: res.data.data.employeeId,
        tempPassword: res.data.tempPassword,
      });
      toast.success(res.data.message || 'Employee successfully onboarded');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({
      fullName: '',
      email: '',
      role: 'EMPLOYEE',
      departmentId: '',
      designationId: '',
      managerId: '',
      joinDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
          onClick={handleReset}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-800/50">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                {successData ? 'Onboarding Complete' : 'Onboard New Employee'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Provision a new user and bootstrap HR modules autonomously.</p>
            </div>
            <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {successData ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Employee Provisioned!</h3>
                <p className="text-gray-400 text-sm max-w-md">The employee account has been created. Payroll drafts, attendance trackers, and onboarding modules have been autonomously booted.</p>
                
                <div className="bg-gray-800 border border-white/10 rounded-xl p-6 w-full mt-6 space-y-4 text-left">
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase">Employee ID</span>
                    <p className="text-lg font-mono text-white tracking-wider">{successData.employeeId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase">Temporary Password</span>
                    <div className="flex items-center gap-2 bg-gray-950 p-3 rounded-lg border border-white/5 mt-1">
                      <Key className="w-4 h-4 text-indigo-400" />
                      <code className="text-indigo-300 font-mono text-lg">{successData.tempPassword}</code>
                    </div>
                  </div>
                  <p className="text-xs text-orange-400/80 mt-4 italic">Please share these credentials securely. They will also be emailed shortly.</p>
                </div>
                
                <button onClick={handleReset} className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors">
                  Close & Refresh Directory
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">Personal Information</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="John Doe" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="john.doe@company.com" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">System Role</label>
                      <select required name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="EMPLOYEE">Standard Employee</option>
                        <option value="SENIOR_MANAGER">Senior Manager</option>
                        <option value="HR_RECRUITER">HR Recruiter</option>
                      </select>
                    </div>
                  </div>

                  {/* Organization Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">Organization</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Department</label>
                      <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="">Select Department...</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Designation</label>
                      <select name="designationId" value={formData.designationId} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="">Select Designation...</option>
                        {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Reporting Manager</label>
                      <select name="managerId" value={formData.managerId} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="">Select Manager...</option>
                        {managers.map(m => <option key={m.id} value={m.id}>{m.user?.fullName}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Joining Date</label>
                      <input required type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                    {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Provisioning...</> : 'Provision Employee'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEmployeeModal;
