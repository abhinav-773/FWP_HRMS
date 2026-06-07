import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, File as FileIcon, CheckCircle, Clock, Search, Filter, 
  AlertTriangle, Calendar, ShieldCheck, RefreshCw, Trash2 
} from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';

const DocumentDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('RESUME');
  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Simulated Versioning / Expiry Dates (for high fidelity demo)
  const [documentMeta, setDocumentMeta] = useState({});

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/documents', {
        params: {
          search: searchQuery,
          type: selectedType === 'ALL' ? undefined : selectedType
        }
      });
      setDocuments(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounced search trigger
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedType]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docName) {
      toast.error('File and Name are required');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', docName);
    formData.append('documentType', docType);

    setIsUploading(true);
    try {
      await axiosClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Document uploaded and AI classified successfully!');
      setFile(null);
      setDocName('');
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to mock expiration alert
  const getExpirationStatus = (doc) => {
    if (doc.documentType === 'ID_PROOF' && doc.name.toLowerCase().includes('passport')) {
      return { days: 28, text: 'Passport expiring soon', severity: 'WARNING' };
    }
    if (doc.documentType === 'CONTRACT' && doc.name.toLowerCase().includes('nda')) {
      return { days: 120, text: 'NDA Active (Auto-renews)', severity: 'INFO' };
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Document Management</h2>
          <p className="text-gray-400 mt-1">Upload, search and verify all digital contract agreements and identity assets.</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters & Uploader */}
        <div className="lg:col-span-1 space-y-6">
          {/* Uploader Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            <h3 className="text-lg font-black text-white mb-4">Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Document Name</label>
                <input 
                  type="text" 
                  required
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="e.g. Passport Copy"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Document Type</label>
                <select 
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option className="bg-gray-900 text-white" value="RESUME">Resume / CV</option>
                  <option className="bg-gray-900 text-white" value="ID_PROOF">ID Proof</option>
                  <option className="bg-gray-900 text-white" value="CONTRACT">Contract</option>
                  <option className="bg-gray-900 text-white" value="CERTIFICATE">Certificate</option>
                  <option className="bg-gray-900 text-white" value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Select File</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-white/20 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    required
                    onChange={e => {
                      const selected = e.target.files[0];
                      setFile(selected);
                      if (selected && !docName) {
                        // Strip extension for suggestion
                        setDocName(selected.name.replace(/\.[^/.]+$/, ""));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileUp className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-400 block font-bold truncate">
                    {file ? file.name : 'Choose file or drag here'}
                  </span>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isUploading}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                <FileUp className="h-5 w-5" />
                <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
              </button>
            </form>
          </motion.div>

          {/* Expiration Alerts Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Compliance Alerts
            </h4>
            
            <div className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-white">Passport Expiry Alert</h5>
                  <p className="text-[10px] text-gray-400 mt-0.5">Your passport copy expires in 28 days. Please upload updated copy.</p>
                </div>
              </div>
              
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-white">All other files compliant</h5>
                  <p className="text-[10px] text-gray-500 mt-0.5">3 active documents verified successfully.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Document search & grid results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filtering row */}
          <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search documents by name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            {/* Filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
              {['ALL', 'RESUME', 'ID_PROOF', 'CONTRACT', 'CERTIFICATE', 'OTHER'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'All Files' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {documents.map((doc, index) => {
                  const alert = getExpirationStatus(doc);
                  
                  return (
                    <motion.div 
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
                    >
                      {/* Background decor */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                            <FileIcon className="h-6 w-6" />
                          </div>
                          
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            doc.isVerified 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {doc.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-white font-bold text-base truncate group-hover:text-indigo-400 transition-colors" title={doc.name}>
                            {doc.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{doc.documentType}</p>
                          <p className="text-[10px] text-gray-500 mt-2">
                            Uploaded: {new Date(doc.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>

                      {/* Expiration alert tags inside node */}
                      {alert && (
                        <div className={`mt-4 p-2 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 ${
                          alert.severity === 'WARNING' 
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                        }`}>
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{alert.text} ({alert.days} days left)</span>
                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-mono">v1.0.0</span>
                        <a 
                          href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline flex items-center gap-1"
                        >
                          View File
                          <span className="text-[9px]">→</span>
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {documents.length === 0 && !isLoading && (
                <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-gray-500">
                  No documents match your query filter.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DocumentDashboard;
