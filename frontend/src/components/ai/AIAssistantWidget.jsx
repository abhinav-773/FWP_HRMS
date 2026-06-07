import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import axiosClient from '../../services/axiosClient';
import {
  MessageSquare, X, Send, Loader2, Sparkles, Plus, History,
  ChevronLeft, Briefcase, FileText, HelpCircle, Bot, User
} from 'lucide-react';

/* ── Role-Aware Suggested Prompts ── */
const SUGGESTED_PROMPTS = {
  EMPLOYEE: [
    { text: 'What is my leave balance?', icon: HelpCircle },
    { text: 'Explain my latest payslip', icon: FileText },
    { text: 'What is the WFH policy?', icon: HelpCircle },
    { text: 'How do I apply for sick leave?', icon: HelpCircle },
  ],
  HR_RECRUITER: [
    { text: 'Generate a JD for Senior React Developer', icon: Briefcase },
    { text: 'Create interview questions for a Python engineer', icon: FileText },
    { text: 'Summarize top candidates for the open role', icon: Briefcase },
    { text: 'What are best practices for technical screening?', icon: HelpCircle },
  ],
  SENIOR_MANAGER: [
    { text: 'Summarize team attendance this month', icon: FileText },
    { text: 'Show attrition risk indicators', icon: HelpCircle },
    { text: 'Who has pending leave approvals?', icon: HelpCircle },
    { text: 'Generate a team performance summary', icon: FileText },
  ],
  SUPER_ADMIN: [
    { text: 'Show platform usage analytics', icon: FileText },
    { text: 'What are recommended RBAC policies?', icon: HelpCircle },
    { text: 'List all active user roles', icon: Briefcase },
    { text: 'How to optimize system performance?', icon: HelpCircle },
  ],
};

/* ── Simple Markdown Renderer ── */
const renderMarkdown = (text) => {
  if (!text) return '';
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-green-300 border border-white/10"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 text-xs font-mono">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-white text-sm mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-white text-base mt-3 mb-1">$1</h3>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-300 text-sm">$1</li>')
    .replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc text-gray-300 text-sm">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-300 text-sm">$1</li>')
    // Action Tags [ACTION: XXX]
    .replace(/\[ACTION:\s*([A-Z_]+)\]/g, (match, p1) => {
      let label = p1.replace('_', ' ');
      return `<button class="my-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold hover:bg-indigo-500/40 transition-colors flex items-center gap-2" onclick="window.dispatchEvent(new CustomEvent('ai-action', {detail: '${p1}'}))"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Execute: ${label}</button>`;
    })
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return html;
};

/* ── Typing Indicator ── */
const TypingIndicator = () => (
  <div className="flex items-center gap-3 p-4">
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

/* ── Main Widget ── */
const AIAssistantWidget = () => {
  const user = useSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role || 'EMPLOYEE';
  const prompts = SUGGESTED_PROMPTS[role] || SUGGESTED_PROMPTS.EMPLOYEE;

  /* Scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Handle custom AI Actions */
  useEffect(() => {
    const handleAiAction = (e) => {
      const action = e.detail;
      if (action === 'NAVIGATE_TO_JOBS') {
        window.location.href = '/hr/jobs';
      }
      // Can add more actions here
    };
    window.addEventListener('ai-action', handleAiAction);
    return () => window.removeEventListener('ai-action', handleAiAction);
  }, []);

  /* Focus input when panel opens */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  /* Load sessions when history panel opens */
  useEffect(() => {
    if (showHistory) {
      loadSessions();
    }
  }, [showHistory]);

  const loadSessions = async () => {
    try {
      const res = await axiosClient.get('/chat/sessions');
      setSessions(res.data.sessions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const res = await axiosClient.get(`/chat/${sessionId}/history`);
      setMessages(res.data.messages || []);
      setCurrentSessionId(sessionId);
      setShowHistory(false);
    } catch (e) {
      console.error(e);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const sendMessage = async (text = null) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const res = await axiosClient.post('/chat', {
        session_id: currentSessionId,
        message: messageText,
        context: `Current Page URL: ${window.location.pathname}`
      });

      if (!currentSessionId && res.data.session_id) {
        setCurrentSessionId(res.data.session_id);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.ai_response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment. 🔄"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-shadow"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[640px] max-h-[85vh] max-w-[calc(100vw-48px)] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-black/30 shrink-0">
              <div className="flex items-center gap-3">
                {showHistory ? (
                  <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">{showHistory ? 'Chat History' : 'HireMind Assistant'}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">{showHistory ? 'Select a conversation' : `${role.replace('_', ' ')} Mode`}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Chat History">
                  <History className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={startNewChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="New Chat">
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {showHistory ? (
                  /* ── Session History Sidebar ── */
                  <motion.div
                    key="history"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="h-full overflow-y-auto p-4 space-y-2 custom-scrollbar"
                  >
                    {sessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm">No previous chats.</div>
                    ) : (
                      sessions.map((s) => (
                        <button
                          key={s.session_id}
                          onClick={() => loadSession(s.session_id)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${
                            currentSessionId === s.session_id 
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-white' 
                              : 'border-white/5 hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <p className="text-sm font-medium truncate">{s.title}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{new Date(s.updated_at).toLocaleString()}</p>
                        </button>
                      ))
                    )}
                  </motion.div>
                ) : (
                  /* ── Chat Messages ── */
                  <motion.div
                    key="chat"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="h-full overflow-y-auto p-4 space-y-1 custom-scrollbar"
                  >
                    {messages.length === 0 && !isLoading ? (
                      /* ── Empty State with Prompts ── */
                      <div className="h-full flex flex-col justify-center items-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6">
                          <Sparkles className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">How can I help?</h4>
                        <p className="text-xs text-gray-500 text-center mb-6">Try one of these prompts or type your question below.</p>
                        <div className="grid grid-cols-1 gap-2.5 w-full">
                          {prompts.map((p, i) => (
                            <button
                              key={i}
                              onClick={() => sendMessage(p.text)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-gray-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-white transition-all group"
                            >
                              <p.icon className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                              <span className="truncate">{p.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-start gap-3 py-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                          >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                              msg.role === 'user' 
                                ? 'bg-gradient-to-tr from-blue-500 to-cyan-500' 
                                : 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/20'
                            }`}>
                              {msg.role === 'user' 
                                ? <User className="w-4 h-4 text-white" /> 
                                : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            {/* Bubble */}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm'
                            }`}>
                              {msg.role === 'assistant' ? (
                                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                              ) : (
                                msg.content
                              )}
                            </div>
                          </motion.div>
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions for Recruiters */}
            {role === 'HR_RECRUITER' && messages.length > 0 && !showHistory && (
              <div className="px-4 pb-2 flex gap-2 shrink-0 overflow-x-auto">
                {['Generate JD', 'Summarize Candidate', 'Interview Questions'].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action)}
                    className="whitespace-nowrap px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            {!showHistory && (
              <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-indigo-500/50 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask HireMind anything..."
                    className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </>
  );
};

export default AIAssistantWidget;
