import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, FileText, Upload, Check } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ChecklistTracker = ({ checklist, onRefresh }) => {
  const [uploadingTaskId, setUploadingTaskId] = useState(null);

  if (!checklist) {
    return (
      <div className="bg-gray-900/30 backdrop-blur-xl border border-white/5 rounded-2xl p-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Active Checklist</h3>
        <p className="text-gray-400">You don't have an active onboarding checklist. Please contact your manager or HR Recruiter.</p>
      </div>
    );
  }

  const tasks = checklist.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = async (task) => {
    if (task.documentRequired && task.status !== 'COMPLETED') {
      toast.error('This task requires a document upload to complete.');
      return;
    }

    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      await axiosClient.put(`/onboarding/tasks/${task.id}`, { status: newStatus });
      toast.success(newStatus === 'COMPLETED' ? 'Task completed!' : 'Task marked pending.');
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update task status.');
    }
  };

  const handleFileUpload = async (e, task) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTaskId(task.id);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', task.title);
    formData.append('documentType', task.title.toLowerCase().includes('nda') ? 'CONTRACT' : 'ID_PROOF');

    try {
      await axiosClient.post(`/onboarding/upload/${task.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Document uploaded and task completed!');
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload document.');
    } finally {
      setUploadingTaskId(null);
    }
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">{checklist.title}</h2>
          <p className="text-gray-400 mt-1 text-sm">{checklist.description || 'Complete the following steps to finalize your onboarding.'}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl">
          <div className="text-right">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Progress</span>
            <span className="text-lg font-black text-white">{completedTasks} / {totalTasks} Tasks</span>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 flex items-center justify-center relative">
            <span className="text-sm font-black text-indigo-400">{percentComplete}%</span>
            {/* SVG circle stroke representation could go here, keeping it clean with simple indicator */}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-2.5 rounded-full mb-8 overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentComplete}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
        />
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const isCompleted = task.status === 'COMPLETED';

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={task.id}
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                isCompleted
                  ? 'bg-indigo-500/5 border-indigo-500/20'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`mt-1 flex-shrink-0 transition-transform hover:scale-110 duration-200 ${
                    isCompleted ? 'text-indigo-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg leading-snug ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    {task.documentRequired && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Document Required
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                    {task.description}
                  </p>

                  {/* Document upload or uploaded indicator */}
                  {task.documentRequired && (
                    <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                      {task.documentUrl ? (
                        <>
                          <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                            <Check className="h-4 w-4" />
                            <span>Document Uploaded</span>
                          </div>
                          <a
                            href={task.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Document
                          </a>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-gray-400 font-medium">Please upload NDA or ID scan to complete task.</span>
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors ${uploadingTaskId === task.id ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload className="h-3.5 w-3.5" />
                            {uploadingTaskId === task.id ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(e, task)}
                              className="hidden"
                              disabled={uploadingTaskId === task.id}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ChecklistTracker;
