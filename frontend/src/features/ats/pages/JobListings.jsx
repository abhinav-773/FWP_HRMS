import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Users, MapPin, Edit, Trash2 } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import JobFormModal from '../components/JobFormModal';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axiosClient.get('/jobs');
      setJobs(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await axiosClient.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (error) {
        alert('Failed to delete job');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Job Listings</h2>
          <p className="text-gray-400 mt-1">Manage active openings and job requisitions.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
        >
          <Plus className="h-5 w-5" />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, idx) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:bg-white/10 transition-colors group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Briefcase className="h-6 w-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  job.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  job.status === 'DRAFT' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {job.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location || 'Remote'}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  {job._count?.applications || 0} Candidates Applied
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills?.slice(0, 3).map((skill, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {job.skills?.length > 3 && (
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                    +{job.skills.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => openEditModal(job)}
                className="p-2 text-gray-400 hover:text-indigo-400 transition-colors bg-gray-800 rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(job.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-gray-800 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {!isLoading && jobs.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-white/5 border border-white/10 rounded-xl">
            <Briefcase className="h-12 w-12 mb-4 opacity-50" />
            <p>No jobs posted yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <JobFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchJobs}
          job={editingJob}
        />
      )}
    </div>
  );
};

export default JobListings;
