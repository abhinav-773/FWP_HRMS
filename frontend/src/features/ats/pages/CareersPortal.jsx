import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Calendar, ChevronRight, Sparkles, Globe, Heart, Zap, Users, Award, Clock, DollarSign } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const PUBLIC_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/public` : 'http://localhost:5000/api/v1/public';

const CareersPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('ALL'); // ALL, REMOTE, ONSITE
  const [expFilter, setExpFilter] = useState('ALL'); // ALL, JUNIOR (0-2), MID (3-5), SENIOR (6+)
  const [empTypeFilter, setEmpTypeFilter] = useState('ALL'); // ALL, FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  // Set SEO Meta Title dynamically
  useEffect(() => {
    document.title = 'HireMind Careers | Join our Team of Builders';
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${PUBLIC_API_URL}/jobs`);
        const jobList = res.data?.data || [];
        setJobs(jobList);

        // Extract unique departments
        const depts = [...new Set(jobList.map(job => job.department?.name).filter(Boolean))];
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load careers listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Filter jobs in-memory based on all inputs
  const filteredJobs = jobs.filter(job => {
    // 1. Search Query
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.description.toLowerCase().includes(search.toLowerCase()) ||
                          (job.skills && job.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));
    
    // 2. Department
    const matchesDept = selectedDept === '' || job.department?.name === selectedDept;

    // 3. Location text
    const matchesLocation = locationInput === '' || 
                            (job.location && job.location.toLowerCase().includes(locationInput.toLowerCase()));

    // 4. Remote option
    const isRemote = job.location && job.location.toLowerCase().includes('remote');
    const matchesRemote = remoteFilter === 'ALL' || 
                          (remoteFilter === 'REMOTE' && isRemote) || 
                          (remoteFilter === 'ONSITE' && !isRemote);

    // 5. Experience fit
    const years = job.experienceRequired || 0;
    let matchesExp = true;
    if (expFilter === 'JUNIOR') matchesExp = years <= 2;
    else if (expFilter === 'MID') matchesExp = years >= 3 && years <= 5;
    else if (expFilter === 'SENIOR') matchesExp = years >= 6;

    // 6. Employment type
    const matchesEmpType = empTypeFilter === 'ALL' || job.employmentType === empTypeFilter;

    return matchesSearch && matchesDept && matchesLocation && matchesRemote && matchesExp && matchesEmpType;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-white relative overflow-hidden font-sans pb-10">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              H
            </div>
            <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              HireMind Careers
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
          >
            Employee Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" /> Autonomous AI Recruiting Engine
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white"
        >
          Join a World-Class Team of <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Builders</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg sm:text-xl mt-6 max-w-2xl mx-auto font-medium"
        >
          Help us build the operating system for autonomous enterprise HR operations. Apply in under 60 seconds and let our AI screen and transition your profile instantly.
        </motion.p>
      </div>

      {/* Careers Statistics */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/30 border border-white/5 p-6 rounded-2xl text-center backdrop-blur-sm">
            <span className="text-3xl font-black text-indigo-400 block">{jobs.length || '15+'}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Open Positions</span>
          </div>
          <div className="bg-gray-900/30 border border-white/5 p-6 rounded-2xl text-center backdrop-blur-sm">
            <span className="text-3xl font-black text-purple-400 block">&lt; 60s</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI Screening Time</span>
          </div>
          <div className="bg-gray-900/30 border border-white/5 p-6 rounded-2xl text-center backdrop-blur-sm">
            <span className="text-3xl font-black text-emerald-400 block">94%</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Culture Match Index</span>
          </div>
          <div className="bg-gray-900/30 border border-white/5 p-6 rounded-2xl text-center backdrop-blur-sm">
            <span className="text-3xl font-black text-pink-400 block">24/7</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Autonomous Hiring</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by role, skills, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none transition-colors"
              />
            </div>

            {/* Location input */}
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by city or country (e.g. Remote, San Francisco)..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Department Selector */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white focus:outline-none text-sm transition-colors"
              >
                <option value="" className="bg-[#090d16] text-gray-400">All Departments</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept} className="bg-[#090d16] text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Remote/On-site Option */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Work Style</label>
              <select
                value={remoteFilter}
                onChange={(e) => setRemoteFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white focus:outline-none text-sm transition-colors"
              >
                <option value="ALL" className="bg-[#090d16] text-white">All Work Styles</option>
                <option value="REMOTE" className="bg-[#090d16] text-white">Remote Only</option>
                <option value="ONSITE" className="bg-[#090d16] text-white">On-site / Hybrid</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Employment Type</label>
              <select
                value={empTypeFilter}
                onChange={(e) => setEmpTypeFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white focus:outline-none text-sm transition-colors"
              >
                <option value="ALL" className="bg-[#090d16] text-white">All Types</option>
                <option value="FULL_TIME" className="bg-[#090d16] text-white">Full Time</option>
                <option value="PART_TIME" className="bg-[#090d16] text-white">Part Time</option>
                <option value="CONTRACT" className="bg-[#090d16] text-white">Contract</option>
                <option value="INTERNSHIP" className="bg-[#090d16] text-white">Internship</option>
              </select>
            </div>

            {/* Experience level filter */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Experience level</label>
              <select
                value={expFilter}
                onChange={(e) => setExpFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white focus:outline-none text-sm transition-colors"
              >
                <option value="ALL" className="bg-[#090d16] text-white">All Experience Levels</option>
                <option value="JUNIOR" className="bg-[#090d16] text-white">Entry Level (0-2 yrs)</option>
                <option value="MID" className="bg-[#090d16] text-white">Mid Level (3-5 yrs)</option>
                <option value="SENIOR" className="bg-[#090d16] text-white">Senior Level (6+ yrs)</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Job Grid Listings */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-900/30 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/20 border border-white/5 rounded-2xl">
            <p className="text-gray-500 font-medium text-lg">No open positions found matching your filter selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.008, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                className="p-6 bg-gray-900/40 backdrop-blur-md border border-white/10 hover:bg-gray-900/60 rounded-2xl shadow-lg transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer text-left"
                onClick={() => navigate(`/careers/job/${job.id}`)}
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] px-2.5 py-1 bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20 rounded-md">
                      {job.department?.name || 'General'}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-white/5 text-gray-300 font-bold border border-white/5 rounded-md flex items-center">
                      <Briefcase className="w-3.5 h-3.5 mr-1 text-indigo-400" /> {job.employmentType?.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20 rounded-md flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-purple-400" /> {job.experienceRequired || 0} years exp
                    </span>
                    {job.closingDate && (
                      <span className="text-[10px] px-2.5 py-1 bg-red-500/10 text-red-400 font-bold border border-red-500/20 rounded-md flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-red-400" /> Deadline: {new Date(job.closingDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white hover:text-indigo-400 transition-colors">
                    {job.title}
                  </h3>
                  
                  {job.aiSummary && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed bg-black/15 p-3 rounded-lg border border-white/5 font-medium italic">
                      ✨ {job.aiSummary}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> {job.location || 'Remote'}</span>
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center text-green-400">
                        <DollarSign className="w-3.5 h-3.5 mr-0.5" /> 
                        {job.salaryMin ? `${job.salaryMin.toLocaleString()}` : ''}
                        {job.salaryMin && job.salaryMax ? ' - ' : ''}
                        {job.salaryMax ? `${job.salaryMax.toLocaleString()}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <button className="flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors py-2.5 px-4 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 rounded-xl shrink-0 w-full md:w-auto justify-center">
                  Apply Now <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Company Culture Section */}
      <div className="max-w-6xl mx-auto px-6 mb-20 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Life at HireMind</h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">We are a fast-moving group of creators, building the future of automated HR operations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Collaborative Excellence</h4>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed font-medium">Work directly with senior engineers and domain experts who value high-agency behavior and ownership.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Continuous Evolution</h4>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed font-medium">We provide unlimited learning materials, access to bleeding-edge generative models, and hardware grants.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">High Trust Workspace</h4>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed font-medium">Flexible work hours, autonomous project choices, and zero unnecessary meetings.</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video bg-gray-900 border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-transparent" />
            <div className="relative text-center p-6 space-y-3 z-10">
              <span className="text-3xl sm:text-4xl font-black text-white block">Work in the Future.</span>
              <p className="text-xs sm:text-sm text-gray-400 font-semibold max-w-sm mx-auto">Explore next-gen AI screening, geofencing, and org synchronization.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-950/60 py-12 px-6 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-left">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="font-black text-white text-sm">H</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">HireMind</span>
            </div>
            <p className="text-sm text-gray-500">The next generation of enterprise HR software, powered by artificial intelligence.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">AI Engine</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} HireMind. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default CareersPortal;
