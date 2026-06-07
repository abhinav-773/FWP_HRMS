import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';

const BulkUploadModal = ({ isOpen, onClose, jobId }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'idle', 'uploading', 'success', 'error'

  const onDrop = useCallback((acceptedFiles) => {
    // Filter and map files to track progress
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending', // pending, uploading, success, error
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !jobId) return;
    
    setIsUploading(true);
    setUploadStatus('uploading');
    
    const formData = new FormData();
    files.forEach(f => {
      formData.append('resumes', f.file);
      // Optimistically set to uploading
      updateFileStatus(f.id, 'uploading', 50);
    });

    try {
      const response = await axiosClient.post(`/bulk-upload/${jobId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadStatus('success');
      toast.success(response.data.message || 'Bulk upload started successfully!');
      
      // Update all to success
      files.forEach(f => updateFileStatus(f.id, 'success', 100));
      
      setTimeout(() => {
        onClose();
        setFiles([]);
        setUploadStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
      toast.error(error.response?.data?.error || 'Failed to upload resumes.');
      files.forEach(f => updateFileStatus(f.id, 'error', 0));
    } finally {
      setIsUploading(false);
    }
  };

  const updateFileStatus = (id, status, progress) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status, progress } : f));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
            <div>
              <h2 className="text-xl font-bold text-white">Bulk Resume Upload</h2>
              <p className="text-sm text-gray-400 mt-1">AI will parse and rank these candidates automatically.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
            
            {/* Dropzone */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-indigo-500/50 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drag & Drop Resumes Here</h3>
              <p className="text-sm text-gray-400">Or click to browse files (PDF, DOCX, TXT)</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Queue ({files.length})</h4>
                <div className="space-y-2">
                  {files.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <File className="w-5 h-5 text-indigo-400 shrink-0" />
                        <span className="text-sm text-gray-200 truncate">{f.file.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 shrink-0">
                        {f.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {f.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {f.status === 'uploading' && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
                        
                        {(f.status === 'pending' || f.status === 'error') && (
                          <button onClick={() => removeFile(f.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end space-x-4">
            <button 
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Upload {files.length > 0 ? `${files.length} Files` : ''}</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BulkUploadModal;
