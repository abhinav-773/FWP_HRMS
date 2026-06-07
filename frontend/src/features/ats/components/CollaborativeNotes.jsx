import React, { useState, useEffect } from 'react';
import { Send, FileText } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';

const CollaborativeNotes = ({ candidateId }) => {
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (candidateId) {
      fetchNotes();
    }
  }, [candidateId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/shared-notes/${candidateId}`);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await axiosClient.post(`/shared-notes/${candidateId}`, { content: inputText });
      setNotes((prev) => [res.data, ...prev]);
      setInputText('');
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center space-x-2">
        <FileText className="h-5 w-5 text-indigo-400" />
        <h3 className="font-semibold text-white">Shared Notes</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900/50 min-h-[300px]">
        {loading ? (
          <div className="text-center text-sm text-gray-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-10">No shared notes yet.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-700/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-indigo-300">{note.author.fullName}</span>
                <span className="text-[10px] text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-200">{note.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add a collaborative note..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CollaborativeNotes;
