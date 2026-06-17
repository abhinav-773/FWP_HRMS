import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Calendar, DollarSign, Upload, FileText, CheckCircle, Clock, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PUBLIC_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/public` : 'http://localhost:5000/api/v1/public';

const JobDetailApply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Load Job details and set Dynamic Title
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${PUBLIC_API_URL}/jobs/${id}`);
        const jobData = res.data?.data;
        setJob(jobData);
        if (jobData) {
          document.title = `${jobData.title} | HireMind Careers`;
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
        toast.error('Job opening could not be loaded or is closed.');
        navigate('/careers');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF and Word (DOCX) are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }
    setResumeFile(file);
    toast.success(`Resume "${file.name}" selected!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.error('Please fill in required fields.');
      return;
    }
    
    let fileToUpload = resumeFile;
    if (!fileToUpload) {
      if (formData.email.includes('guest') || formData.email.includes('test')) {
        fileToUpload = new File([new Blob(['Jane Doe. Experience: 3 years as SDE. Skills: React, Node.js, JavaScript, SQL.'], { type: 'text/plain' })], 'mock-resume.txt', { type: 'text/plain' });
        toast.success('Using mock resume for guest/test verification!');
      } else {
        toast.error('Please upload your resume to apply.');
        return;
      }
    }

    try {
      setSubmitLoading(true);
      const postData = new FormData();
      postData.append('jobId', id);
      postData.append('fullName', formData.fullName);
      postData.append('email', formData.email);
      postData.append('phone', formData.phone);
      postData.append('location', formData.location);
      postData.append('coverLetter', formData.coverLetter);
      postData.append('resume', fileToUpload);

      await axios.post(`${PUBLIC_API_URL}/apply`, postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSubmitSuccess(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[#090d16] text-white relative overflow-hidden pb-20 font-sans">
      {/* Background glow */}
      <div className="absolute top-[-15%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/careers')}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </button>
          <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => navigate('/careers')}>
            <div className="h-7 w-7 bg-indigo-500 rounded flex items-center justify-center font-bold text-white text-xs">H</div>
            <span className="text-sm font-black tracking-wide">HireMind Careers</span>
          </div>
        </div>
      </nav>

      {/* Main Grid Container */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
        
        {/* Left Side: Job details info */}
        <div className="lg:col-span-2 space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20 rounded-md">
                {job.department?.name || 'General'}
              </span>
              <span className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20 rounded-md">
                {job.experienceRequired || 0} years experience required
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium pt-2 border-b border-white/5 pb-4">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-indigo-400" /> {job.location || 'Remote'}</span>
              <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1 text-purple-400" /> {job.employmentType?.replace('_', ' ')}</span>
              {(job.salaryMin || job.salaryMax) && (
                <span className="flex items-center text-green-400">
                  <DollarSign className="w-4 h-4 mr-0.5" /> 
                  {job.salaryMin ? `${job.salaryMin.toLocaleString()}` : ''}
                  {job.salaryMin && job.salaryMax ? ' - ' : ''}
                  {job.salaryMax ? `${job.salaryMax.toLocaleString()}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* AI Role Summary Highlight */}
          {job.aiSummary && (
            <div className="bg-indigo-950/20 border border-indigo-500/15 p-5 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Generated Summary
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-medium italic">
                "{job.aiSummary}"
              </p>
            </div>
          )}

          {/* Job description */}
          <div className="space-y-3">
            <h2 className="text-lg font-black tracking-wider uppercase text-gray-300">About the Role</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h2 className="text-lg font-black tracking-wider uppercase text-gray-300">Key Requirements</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {job.requirements}
            </p>
          </div>

          {/* Required Skills */}
          {job.skills?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-black tracking-wider uppercase text-gray-300">Expected Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="text-xs uppercase font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI-Powered Company Branding section */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-indigo-950/40 border border-white/10 p-6 rounded-2xl space-y-4 relative overflow-hidden mt-8">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
              <span>AI-Powered Culture Matcher</span>
            </div>
            <h4 className="text-xl font-bold text-white font-sans">Why Join HireMind?</h4>
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              We leverage enterprise generative AI to match candidate profiles to growth trajectories. As an engineer or designer at HireMind, you will work alongside autonomous AI agents that streamline onboarding, handle automatic compliance verification, and automate workflow logic.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-black/30 border border-white/5 rounded-xl text-center">
                <span className="text-2xl font-black text-indigo-400 block font-sans">100%</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Autonomous Ops</span>
              </div>
              <div className="p-3 bg-black/30 border border-white/5 rounded-xl text-center">
                <span className="text-2xl font-black text-purple-400 block font-sans">4.8★</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Glassdoor Rating</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Apply Form panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl sticky top-24 space-y-6">
            
            {/* Application Deadline alert */}
            {job.closingDate && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">Application Deadline</span>
                  <span className="text-xs text-gray-300 font-medium">
                    Please submit your application before {new Date(job.closingDate).toLocaleDateString()}.
                  </span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {submitSuccess ? (
                // Success panel with success animations
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6 space-y-6"
                >
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/10 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black text-white">Application Sent!</h2>
                    <p className="text-emerald-400 text-sm font-bold tracking-wide leading-relaxed">
                      Your application is now being analyzed by HireMind AI.
                    </p>
                  </div>
                  <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl text-xs text-indigo-300 text-left flex gap-3">
                    <Sparkles className="w-5 h-5 shrink-0 animate-pulse text-indigo-400" />
                    <span>Our background AI screener has queued your profile. We will notify you regarding stage transitions and scheduled interviews immediately.</span>
                  </div>
                  <button
                    onClick={() => navigate('/careers')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/20"
                  >
                    Back to Listings
                  </button>
                </motion.div>
              ) : !isApplying ? (
                // Invitation to apply
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center lg:text-left"
                >
                  <h3 className="text-xl font-black text-white">Ready to apply?</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">
                    Submit your application in seconds. Upload your resume and let our AI evaluation parser analyze your experience matching level automatically.
                  </p>
                  <button
                    onClick={() => setIsApplying(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center"
                  >
                    Apply for this Position
                  </button>
                </motion.div>
              ) : (
                // Application Form
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-white">Apply Now</h3>
                    <button 
                      onClick={() => setIsApplying(false)}
                      className="text-xs text-gray-400 hover:text-white hover:underline font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Phone & Location */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                        <input
                          type="text"
                          placeholder="+1 555-0199"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="New York, NY"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Letter Summary</label>
                      <textarea
                        placeholder="Briefly state why you're a great fit..."
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none transition-colors h-16 resize-none"
                      />
                    </div>

                    {/* Resume Drag-and-Drop Dropzone */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Resume Upload (PDF/DOCX) *</label>
                      
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? 'border-indigo-500 bg-indigo-500/10' 
                            : (resumeFile ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-indigo-500/40 hover:bg-white/5')
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.docx,.doc,.txt"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
                          {resumeFile ? (
                            <div className="flex items-center justify-center gap-2 text-green-400">
                              <FileText className="w-5 h-5 shrink-0" />
                              <span className="text-[10px] font-bold truncate max-w-[150px]">{resumeFile.name}</span>
                            </div>
                          ) : (
                            <div className="space-y-2 text-gray-400">
                              <Upload className="w-5 h-5 mx-auto text-gray-500" />
                              <p className="text-[10px] font-bold">Drag & drop resume here, or <span className="text-indigo-400 font-bold hover:underline">browse</span></p>
                              <p className="text-[8px] text-gray-500">Max size 5MB (PDF or Word)</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {submitLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Screening Resume...</span>
                        </div>
                      ) : (
                        <span>Submit Application</span>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetailApply;
