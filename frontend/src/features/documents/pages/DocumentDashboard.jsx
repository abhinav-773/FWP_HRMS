import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileUp, File as FileIcon, CheckCircle, Clock } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';

const DocumentDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('RESUME');
  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await axiosClient.get('/documents');
      setDocuments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docName) return alert('File and Name are required');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', docName);
    formData.append('documentType', docType);

    setIsUploading(true);
    try {
      // Must use a raw axios request if the client doesn't handle multipart properly
      // Or just pass the formData to axiosClient
      await axiosClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Document uploaded successfully!');
      setFile(null);
      setDocName('');
      fetchDocuments();
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">My Documents</h2>
          <p className="text-gray-400 mt-1">Upload and manage your HR documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Upload New Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Document Name</label>
                <input 
                  type="text" 
                  required
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="e.g. John Doe Resume 2024"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Document Type</label>
                <select 
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="RESUME">Resume / CV</option>
                  <option value="ID_PROOF">ID Proof</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select File</label>
                <input 
                  type="file" 
                  required
                  onChange={e => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
              </div>
              <button 
                type="submit"
                disabled={isUploading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium text-white transition-colors"
              >
                <FileUp className="h-5 w-5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors flex flex-col justify-between"
              >
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{doc.documentType}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className={`flex items-center text-xs font-medium ${
                    doc.isVerified ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {doc.isVerified ? (
                      <><CheckCircle className="h-4 w-4 mr-1" /> Verified</>
                    ) : (
                      <><Clock className="h-4 w-4 mr-1" /> Pending Verification</>
                    )}
                  </span>
                  <a 
                    href={`http://localhost:3000${doc.fileUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View File
                  </a>
                </div>
              </motion.div>
            ))}
            
            {documents.length === 0 && !isLoading && (
              <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
                No documents uploaded yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentDashboard;
