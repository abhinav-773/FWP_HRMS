import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Calendar, Clock, ChevronDown, UploadCloud, Eye, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../../services/axiosClient';
import { useSocket } from '../../../contexts/SocketContext';
import BulkUploadModal from '../components/BulkUploadModal';
import CandidateProfileModal from '../components/CandidateProfileModal';
import InterviewScheduler from '../../interviews/components/InterviewScheduler';

const STAGES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'SHORTLISTED', 'HIRED', 'REJECTED'];

const PipelineBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [minScore, setMinScore] = useState(0); // For AI Filtering
  const [selectedApplicationForModal, setSelectedApplicationForModal] = useState(null);
  const [selectedApplicationForInterview, setSelectedApplicationForInterview] = useState(null);
  const socket = useSocket();

  // Fetch all jobs to populate dropdown
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosClient.get('/jobs?status=OPEN');
        setJobs(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedJob(res.data.data[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    if (!selectedJob) return;
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/applications?jobId=${selectedJob}`);
      const apps = res.data.data;
      
      const initialColumns = STAGES.reduce((acc, stage) => {
        acc[stage] = [];
        return acc;
      }, {});

      apps.forEach(app => {
        if (initialColumns[app.stage]) {
          initialColumns[app.stage].push(app);
        }
      });

      if (initialColumns['APPLIED'].length > 0) {
        initialColumns['APPLIED'].sort((a, b) => {
          const scoreA = a.aiScore || 0;
          const scoreB = b.aiScore || 0;
          return scoreB - scoreA;
        });
      }

      setApplications(initialColumns);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    
    // Socket real-time updates for ATS board
    if (socket && selectedJob) {
      socket.emit('join_job_room', selectedJob);
      
      const handleAtsUpdate = () => {
        fetchApplications();
      };
      
      socket.on('ats_update', handleAtsUpdate);
      
      return () => {
        socket.off('ats_update', handleAtsUpdate);
        socket.emit('leave_job_room', selectedJob);
      };
    }
  }, [selectedJob, socket]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = [...applications[source.droppableId]];
    const destColumn = [...applications[destination.droppableId]];
    const [movedApp] = sourceColumn.splice(source.index, 1);

    // Optimistic UI update
    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, movedApp);
      setApplications(prev => ({
        ...prev,
        [source.droppableId]: sourceColumn
      }));
    } else {
      movedApp.stage = destination.droppableId;
      destColumn.splice(destination.index, 0, movedApp);
      setApplications(prev => ({
        ...prev,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn
      }));

      // Backend update
      try {
        await axiosClient.put(`/applications/${draggableId}/stage`, {
          stage: destination.droppableId,
          note: `Moved from ${source.droppableId} to ${destination.droppableId}`
        });
        toast.success(`Candidate moved to ${destination.droppableId.replace('_', ' ')}`);
      } catch (error) {
        console.error(error);
        toast.error('Failed to update application stage.');
      }
    }
  };

  const renderInterviewStatus = (app) => {
    if (!app.interviews || app.interviews.length === 0) {
      return (
        <button 
          onClick={() => setSelectedApplicationForInterview(app)}
          className="w-full mt-1.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded text-xs font-semibold flex items-center justify-center transition-colors border border-purple-500/20"
        >
          <Video className="w-3.5 h-3.5 mr-1.5" /> Schedule Interview
        </button>
      );
    }

    const interview = app.interviews[0];
    const isF2F = interview.interviewType === 'FACE_TO_FACE';
    const providerLabel = interview.meetingProvider === 'GOOGLE_MEET' ? 'Google Meet' :
                          interview.meetingProvider === 'ZOOM' ? 'Zoom' :
                          interview.meetingProvider === 'MS_TEAMS' ? 'MS Teams' : 'Virtual';
    
    const statusLabel = interview.interviewStatus === 'AI_INTERVIEW_COMPLETED' || interview.interviewStatus === 'FACE_TO_FACE_COMPLETED'
      ? 'Completed'
      : 'Scheduled';

    const roundsText = interview.interviewRounds && interview.interviewRounds.length > 0
      ? interview.interviewRounds.join(', ')
      : '';

    return (
      <div className="mt-1.5 space-y-1">
        <div className={`w-full p-2 rounded text-xs border ${
          statusLabel === 'Completed' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
        }`}>
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              {isF2F ? 'Face-to-Face' : 'AI Voice'}
            </span>
            <span className="text-[10px] uppercase tracking-wider bg-indigo-900/40 px-1.5 py-0.5 rounded text-indigo-200">
              {statusLabel}
            </span>
          </div>
          
          {isF2F && (
            <div className="mt-1 text-[11px] text-gray-400 flex flex-col gap-0.5 border-t border-white/5 pt-1.5">
              <span>Rounds: <strong className="text-gray-300">{roundsText}</strong></span>
              <span>Via: <strong className="text-gray-300">{providerLabel}</strong></span>
              {interview.interviewerName && <span>Interviewer: <strong className="text-gray-300">{interview.interviewerName}</strong></span>}
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            const url = `${window.location.origin}/ai-interview/${interview.meetingUrl}`;
            navigator.clipboard.writeText(url);
            toast.success("Candidate Portal Link Copied!");
          }}
          className="w-full py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors text-center border border-white/5"
        >
          Copy Candidate Link
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white">ATS Pipeline</h2>
          <p className="text-gray-400 mt-1">Drag and drop candidates across stages.</p>
        </div>
        <div className="relative">
          <select
            value={selectedJob || ''}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>Select a Job Posting</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-1 border border-gray-700">
          <span className="text-sm text-gray-400">Min Score: {minScore}%</span>
          <input 
            type="range" 
            min="0" max="100" step="5" 
            value={minScore} 
            onChange={(e) => setMinScore(Number(e.target.value))} 
            className="w-24 accent-indigo-500" 
          />
        </div>

        <button 
          onClick={() => setIsBulkUploadOpen(true)}
          disabled={!selectedJob}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4 mr-2" /> Bulk AI Screen
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex space-x-6 h-full items-stretch min-w-max">
            {STAGES.map((stage, i) => (
              <div key={i} className="w-80 flex flex-col bg-gray-900/30 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-black/10">
                  <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex-1 p-3 space-y-3">
                  {[1, 2].map(j => (
                    <div key={j} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-6 h-full items-stretch min-w-max">
              {STAGES.map(stage => (
                <div key={stage} className="w-80 flex flex-col bg-gray-900/50 rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-300 text-sm tracking-wide">{stage.replace('_', ' ')}</h3>
                    <span className="bg-gray-800 text-xs text-gray-400 px-2 py-1 rounded-full">
                      {applications[stage]?.length || 0}
                    </span>
                  </div>
                  
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto min-h-[200px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-indigo-900/10' : ''
                        }`}
                      >
                        {applications[stage]?.filter(app => (app.aiScore || 0) >= minScore).map((app, index) => (
                          <Draggable key={app.id} draggableId={app.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 bg-gray-800 border ${
                                  snapshot.isDragging ? 'border-indigo-500 shadow-xl shadow-indigo-500/20' : 'border-gray-700 hover:border-gray-600'
                                } rounded-lg p-4 transition-colors cursor-grab active:cursor-grabbing`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-white text-sm">{app.candidate?.fullName}</h4>
                                  {app.aiScore !== null && app.aiScore !== undefined ? (
                                    <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                                      app.aiScore >= 80 ? 'bg-green-500/20 text-green-400' :
                                      app.aiScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                      {Math.round(app.aiScore)}% AI
                                    </div>
                                  ) : (
                                    <div className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 animate-pulse">
                                      AI Processing...
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1.5 mt-3">
                                    <button 
                                      onClick={() => setSelectedApplicationForModal(app)}
                                      className="w-full mt-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded text-xs font-semibold flex items-center justify-center transition-colors"
                                    >
                                      <Eye className="w-3.5 h-3.5 mr-1.5" /> View AI Insights
                                    </button>
                                    
                                    {renderInterviewStatus(app)}

                                  {app.candidate?.resumeUrl && (
                                    <div className="flex items-center text-xs text-indigo-400 mt-2">
                                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                                      <a href={`http://localhost:5000${app.candidate.resumeUrl}`} target="_blank" rel="noreferrer" className="hover:underline">View PDF Resume</a>
                                    </div>
                                  )}
                                  <div className="flex items-center text-xs text-gray-400">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    Applied {new Date(app.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      <BulkUploadModal 
        isOpen={isBulkUploadOpen} 
        onClose={() => {
          setIsBulkUploadOpen(false);
          fetchApplications(); // Refresh after upload
        }} 
        jobId={selectedJob} 
      />

      <CandidateProfileModal
        isOpen={!!selectedApplicationForModal}
        onClose={() => setSelectedApplicationForModal(null)}
        candidate={selectedApplicationForModal?.candidate}
        application={selectedApplicationForModal}
        onRefresh={fetchApplications}
      />

      {selectedApplicationForInterview && (
        <InterviewScheduler
          application={selectedApplicationForInterview}
          onClose={() => setSelectedApplicationForInterview(null)}
          onScheduled={(interview) => {
            console.log('Scheduled interview:', interview);
            
            // Create the full URL for the candidate room
            const roomUrl = `${window.location.origin}/ai-interview/${interview.meetingUrl}`;
            
            toast.success(
              <div className="flex flex-col">
                <span>Interview Scheduled Successfully!</span>
                <span className="text-xs text-gray-400 mt-1">Candidate Link:</span>
                <a href={roomUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline break-all mt-1">
                  {roomUrl}
                </a>
                <button 
                  onClick={() => navigator.clipboard.writeText(roomUrl)}
                  className="mt-2 text-xs bg-indigo-500/20 text-indigo-400 py-1 rounded"
                >
                  Copy Link
                </button>
              </div>,
              { duration: 10000 }
            );
            
            setSelectedApplicationForInterview(null);
          }}
        />
      )}
    </div>
  );
};

export default PipelineBoard;
