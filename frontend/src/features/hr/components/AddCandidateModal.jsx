import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Briefcase, FileText, Loader } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';

const AddCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobId: '',
    experience: '',
    skills: '',
  });
  const [resume, setResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axiosClient.get('/jobs')
        .then(res => setJobs(res.data.data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fd = new FormData();
    Object.keys(formData).forEach(key => fd.append(key, formData[key]));
    if (resume) fd.append('resume', resume);

    try {
      await axiosClient.post('/candidates', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Candidate added to pipeline successfully!');
      if (onSuccess) onSuccess();
      handleReset();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '', email: '', phone: '', jobId: '', experience: '', skills: ''
    });
    setResume(null);
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
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-800/50">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Add New Candidate
              </h2>
              <p className="text-xs text-gray-400 mt-1">Add candidate and insert them into the ATS pipeline.</p>
            </div>
            <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Alice Smith" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="alice@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Job Role (Pipeline)</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <select required name="jobId" value={formData.jobId} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                        <option value="">Select Job...</option>
                        {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Experience (Years)</label>
                    <input required type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="5" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Skills (comma separated)</label>
                    <input required type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="React, Node.js, TypeScript" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Resume Upload (PDF)</label>
                <div className="relative flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-950 hover:bg-gray-900 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 text-indigo-400 mb-3" />
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{resume ? resume.name : 'PDF, DOCX up to 5MB'}</p>
                    </div>
                    <input required type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button type="button" onClick={handleReset} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                  {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddCandidateModal;
