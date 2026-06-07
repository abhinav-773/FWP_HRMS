import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Search, Plus, MapPin } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import AddCandidateModal from '../../hr/components/AddCandidateModal';

const CandidateDirectory = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axiosClient.get(`/candidates${searchTerm ? `?search=${searchTerm}` : ''}`);
        setCandidates(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCandidates();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleRefresh = async () => {
    try {
      const res = await axiosClient.get(`/candidates${searchTerm ? `?search=${searchTerm}` : ''}`);
      setCandidates(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Candidate Database</h2>
          <p className="text-gray-400 mt-1">Manage and track candidate profiles.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Candidate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate, idx) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="h-14 w-14 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl shrink-0">
                {candidate.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate" title={candidate.fullName}>
                  {candidate.fullName}
                </h3>
                <p className="text-sm text-indigo-400 truncate mt-0.5">{candidate.email}</p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {candidate.location || 'Location Not Specified'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Skills</span>
                <span className="text-xs text-gray-500">{candidate.experience} yrs exp</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {candidate.skills?.length > 0 ? candidate.skills.slice(0, 4).map((skill, i) => (
                  <span key={i} className="text-[10px] uppercase font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded">
                    {skill}
                  </span>
                )) : <span className="text-xs text-gray-500 italic">No skills listed</span>}
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-400">
                  <span className="text-white font-bold mr-1">{candidate._count?.applications || 0}</span> Applications
                </div>
                {candidate.resumeUrl && (
                  <a href={`http://localhost:5000${candidate.resumeUrl}`} target="_blank" rel="noreferrer" className="flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300">
                    <FileText className="h-4 w-4 mr-1" /> View Resume
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {!isLoading && candidates.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-white/5 border border-white/10 rounded-xl">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p>No candidates found matching your criteria.</p>
          </div>
        )}
      </div>

      <AddCandidateModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleRefresh} 
      />
    </div>
  );
};

export default CandidateDirectory;
