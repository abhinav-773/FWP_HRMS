import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import axiosClient from '../../services/axiosClient';
import {
  MessageSquare, X, Send, Loader2, Sparkles, Plus, History,
  ChevronLeft, Briefcase, FileText, HelpCircle, Bot, User,
  Zap, Table2, CheckCircle2, Copy, Search, Users, BarChart3, ClipboardList
} from 'lucide-react';

/* ── Role-Aware Quick Action Prompts ── */
const QUICK_ACTIONS = {
  HR_RECRUITER: [
    { text: 'Show top 10 React candidates', icon: Search, category: 'action' },
    { text: 'Generate JD for AI Engineer', icon: FileText, category: 'action' },
    { text: 'Move shortlisted candidates to interview', icon: Zap, category: 'action' },
    { text: 'Summarize ATS pipeline', icon: BarChart3, category: 'action' },
  ],
  SENIOR_MANAGER: [
    { text: 'Show employees with low productivity', icon: Users, category: 'action' },
    { text: 'Generate weekly performance report', icon: BarChart3, category: 'action' },
    { text: 'Show my pending tasks', icon: ClipboardList, category: 'action' },
    { text: 'Who has pending leave approvals?', icon: HelpCircle, category: 'chat' },
  ],
  EMPLOYEE: [
    { text: 'Show my pending tasks', icon: ClipboardList, category: 'action' },
    { text: 'Summarize my performance this month', icon: BarChart3, category: 'action' },
    { text: 'What is my leave balance?', icon: HelpCircle, category: 'chat' },
    { text: 'Explain my latest payslip', icon: FileText, category: 'chat' },
  ],
  SUPER_ADMIN: [
    { text: 'Summarize ATS pipeline', icon: BarChart3, category: 'action' },
    { text: 'Show top 10 candidates', icon: Search, category: 'action' },
    { text: 'Generate weekly performance report', icon: BarChart3, category: 'action' },
    { text: 'Generate JD for Full Stack Developer', icon: FileText, category: 'action' },
  ],
};

/* ── Markdown Renderer ── */
const renderMarkdown = (text) => {
  if (!text) return '';
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-green-300 border border-white/10"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 text-xs font-mono">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-white text-sm mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-white text-base mt-3 mb-1">$1</h3>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-indigo-500 pl-3 my-2 text-sm text-gray-300 italic">$1</blockquote>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      const isHeader = cells.some(c => /^[-:]+$/.test(c.trim()));
      if (isHeader) return '';
      const tag = 'td';
      return `<tr>${cells.map(c => `<${tag} class="px-3 py-1.5 border-b border-white/5 text-xs">${c.trim()}</${tag}>`).join('')}</tr>`;
    })
    .replace(/- (.+)/g, '<li class="ml-4 list-disc text-gray-300 text-sm">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  // Wrap table rows in table tags
  if (html.includes('<tr>')) {
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table class="w-full border-collapse my-2 bg-white/5 rounded-lg overflow-hidden border border-white/10">$1</table>');
  }

  return html;
};

/* ── Data Table Component ── */
const ActionDataTable = ({ result }) => {
  if (!result.rows || result.rows.length === 0) return null;

  return (
    <div className="my-2 rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-white">{result.title}</span>
        </div>
        {result.metadata?.total !== undefined && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
            {result.metadata.total} results
          </span>
        )}
      </div>
      {result.description && (
        <p className="px-4 pt-2 text-[11px] text-gray-500">{result.description}</p>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              {result.columns.map((col, i) => (
                <th key={i} className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {result.columns.map((col, ci) => (
                  <td key={ci} className="px-4 py-2 text-xs text-gray-300 whitespace-nowrap">
                    {col === 'AI Score' ? (
                      <span className={`font-bold ${
                        Number(row[col]) >= 80 ? 'text-green-400' : 
                        Number(row[col]) >= 60 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {row[col]}
                      </span>
                    ) : col === 'Stage' || col === 'New Stage' ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row[col] === 'INTERVIEW' ? 'bg-blue-500/20 text-blue-300' :
                        row[col] === 'HIRED' ? 'bg-green-500/20 text-green-300' :
                        row[col] === 'SHORTLISTED' ? 'bg-yellow-500/20 text-yellow-300' :
                        row[col] === 'APPLIED' ? 'bg-gray-500/20 text-gray-300' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {row[col]}
                      </span>
                    ) : col === 'Priority' ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row[col] === 'HIGH' ? 'bg-red-500/20 text-red-300' :
                        row[col] === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {row[col]}
                      </span>
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ── Confirmation Card ── */
const ActionConfirmation = ({ result }) => (
  <div className="my-2 rounded-xl border border-green-500/30 bg-green-500/5 overflow-hidden">
    <div className="px-4 py-3 flex items-center gap-2">
      <CheckCircle2 className="w-5 h-5 text-green-400" />
      <span className="text-sm font-bold text-green-300">{result.title}</span>
    </div>
    {result.description && (
      <p className="px-4 pb-2 text-xs text-gray-400">{result.description}</p>
    )}
    {result.rows && <ActionDataTable result={result} />}
  </div>
);

/* ── Generated Content Card ── */
const GeneratedContent = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold text-white">{result.title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {result.description && (
        <p className="px-4 pt-2 text-[11px] text-gray-500">{result.description}</p>
      )}
      <div
        className="px-4 py-3 text-sm text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(result.content) }}
      />
    </div>
  );
};

/* ── Structured Result Renderer ── */
const ActionResultRenderer = ({ result }) => {
  if (!result) return null;

  switch (result.type) {
    case 'data_table':
      return <ActionDataTable result={result} />;
    case 'confirmation':
      return <ActionConfirmation result={result} />;
    case 'generated_content':
      return <GeneratedContent result={result} />;
    case 'text':
    default:
      return null; // Handled by regular markdown rendering
  }
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
  const actions = QUICK_ACTIONS[role] || QUICK_ACTIONS.EMPLOYEE;

  /* Scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

      const assistantMsg = {
        role: 'assistant',
        content: res.data.ai_response,
        actionResult: res.data.action_result || null,
        actionExecuted: res.data.action_executed || false,
        actionId: res.data.action_id || null,
      };

      setMessages(prev => [...prev, assistantMsg]);
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
            className="fixed bottom-6 right-6 z-50 w-[440px] h-[680px] max-h-[85vh] max-w-[calc(100vw-48px)] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
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
                  <h3 className="text-sm font-bold text-white">{showHistory ? 'Chat History' : 'HireMind Copilot'}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {showHistory ? 'Select a conversation' : (
                      <span className="flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-yellow-400" />
                        {role.replace('_', ' ')} Mode — Actions Enabled
                      </span>
                    )}
                  </p>
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
                      /* ── Empty State with Quick Actions ── */
                      <div className="h-full flex flex-col justify-center items-center px-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-5">
                          <Sparkles className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1">HireMind Copilot</h4>
                        <p className="text-[11px] text-gray-500 text-center mb-6">
                          Ask a question or execute an action below.
                        </p>

                        {/* Quick Actions Grid */}
                        <div className="w-full space-y-2">
                          {actions.map((a, i) => (
                            <button
                              key={i}
                              onClick={() => sendMessage(a.text)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-[13px] transition-all group ${
                                a.category === 'action'
                                  ? 'bg-indigo-500/5 border-indigo-500/20 text-gray-200 hover:bg-indigo-500/15 hover:border-indigo-500/40 hover:text-white'
                                  : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.07] hover:border-white/20 hover:text-white'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                a.category === 'action'
                                  ? 'bg-indigo-500/20 text-indigo-400'
                                  : 'bg-white/10 text-gray-500'
                              }`}>
                                <a.icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate font-medium">{a.text}</span>
                              {a.category === 'action' && (
                                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider shrink-0">
                                  Action
                                </span>
                              )}
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
                            transition={{ delay: i * 0.03 }}
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
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm'
                            }`}>
                              {msg.role === 'assistant' ? (
                                <>
                                  {/* Action badge */}
                                  {msg.actionExecuted && msg.actionId && (
                                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/10">
                                      <Zap className="w-3 h-3 text-yellow-400" />
                                      <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
                                        Action: {msg.actionId.replace(/_/g, ' ')}
                                      </span>
                                    </div>
                                  )}
                                  {/* Structured result */}
                                  {msg.actionResult && msg.actionResult.type !== 'text' ? (
                                    <ActionResultRenderer result={msg.actionResult} />
                                  ) : (
                                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                                  )}
                                </>
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

            {/* Contextual Quick Actions Bar */}
            {messages.length > 0 && !showHistory && !isLoading && (
              <div className="px-3 pb-2 flex gap-1.5 shrink-0 overflow-x-auto">
                {actions
                  .filter(a => a.category === 'action')
                  .slice(0, 3)
                  .map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.text)}
                    className="whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    {action.text.length > 25 ? action.text.substring(0, 25) + '…' : action.text}
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
                    placeholder="Ask or run an action..."
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
