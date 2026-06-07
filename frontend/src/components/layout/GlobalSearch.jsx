import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Briefcase, User, Calendar, FileText, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';

const CATEGORY_ICONS = {
  employee: Users,
  candidate: User,
  job: Briefcase,
  interview: Calendar,
};

const CATEGORY_COLORS = {
  employee: 'text-blue-400 bg-blue-500/20',
  candidate: 'text-purple-400 bg-purple-500/20',
  job: 'text-indigo-400 bg-indigo-500/20',
  interview: 'text-pink-400 bg-pink-500/20',
};

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results || []);
        setSelectedIndex(0);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((result) => {
    setIsOpen(false);
    if (result.type === 'employee') navigate('/directory');
    else if (result.type === 'candidate') navigate('/hr/candidates');
    else if (result.type === 'job') navigate('/hr/jobs');
    else if (result.type === 'interview') navigate('/hr/interviews');
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/10 hover:text-gray-300 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-500 ml-4">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
            >
              <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search employees, candidates, jobs, interviews..."
                    className="flex-1 bg-transparent text-white text-base placeholder-gray-500 outline-none"
                  />
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-6 space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="w-8 h-8 bg-gray-800 rounded-lg" />
                          <div className="flex-1"><div className="h-4 bg-gray-800 rounded w-1/2" /></div>
                        </div>
                      ))}
                    </div>
                  ) : results.length > 0 ? (
                    <div className="p-2">
                      {results.map((result, i) => {
                        const Icon = CATEGORY_ICONS[result.type] || FileText;
                        const colorClass = CATEGORY_COLORS[result.type] || 'text-gray-400 bg-gray-500/20';
                        return (
                          <button
                            key={i}
                            onClick={() => handleSelect(result)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                              i === selectedIndex ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{result.title}</p>
                              <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">{result.type}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : query.trim() ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      No results found for "{query}"
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      Start typing to search across the platform...
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4 text-[10px] text-gray-600">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>esc Close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch;
