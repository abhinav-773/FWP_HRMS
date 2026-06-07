import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import axiosClient from '../../../services/axiosClient';
import {
  MessageSquare, Send, Loader2, Plus, History,
  HelpCircle, Bot, User, Trash2, ArrowRight
} from 'lucide-react';

/* ── Role-Aware Suggested Prompts ── */
const SUGGESTED_PROMPTS = {
  EMPLOYEE: [
    { text: 'What is my leave balance?', icon: HelpCircle },
    { text: 'Explain my latest payslip', icon: HelpCircle },
    { text: 'What is the WFH policy?', icon: HelpCircle },
    { text: 'How do I apply for sick leave?', icon: HelpCircle },
  ],
  HR_RECRUITER: [
    { text: 'Generate a JD for Senior React Developer', icon: HelpCircle },
    { text: 'Create interview questions for a Python engineer', icon: HelpCircle },
    { text: 'Summarize top candidates for the open role', icon: HelpCircle },
  ],
  SENIOR_MANAGER: [
    { text: 'Summarize team attendance this month', icon: HelpCircle },
    { text: 'Who has pending leave approvals?', icon: HelpCircle },
    { text: 'Generate a team performance summary', icon: HelpCircle },
  ],
  SUPER_ADMIN: [
    { text: 'Show platform usage analytics', icon: HelpCircle },
    { text: 'What are recommended RBAC policies?', icon: HelpCircle },
  ],
};

/* ── Simple Markdown Renderer ── */
const renderMarkdown = (text) => {
  if (!text) return '';
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-green-300 border border-white/10"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 text-xs font-mono">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-white text-sm mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-white text-base mt-3 mb-1">$1</h3>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-300 text-sm">$1</li>')
    .replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc text-gray-300 text-sm">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-300 text-sm">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return html;
};

const AIChatPortal = () => {
  const user = useSelector(selectCurrentUser);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role || 'EMPLOYEE';
  const prompts = SUGGESTED_PROMPTS[role] || SUGGESTED_PROMPTS.EMPLOYEE;

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadSessions = async () => {
    setIsSidebarLoading(true);
    try {
      const res = await axiosClient.get('/chat/sessions');
      setSessions(res.data.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSidebarLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/chat/${sessionId}/history`);
      setMessages(res.data.messages || []);
      setCurrentSessionId(sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    inputRef.current?.focus();
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await axiosClient.delete(`/chat/sessions/${sessionId}`);
      if (currentSessionId === sessionId) {
        startNewChat();
      }
      loadSessions();
    } catch (err) {
      console.error('Failed to delete chat session:', err);
    }
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
        loadSessions(); // Reload sessions list to show the new chat
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
    <div className="flex h-[calc(100vh-8rem)] bg-gray-950/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Sidebar - Sessions List */}
      <aside className="w-80 border-r border-white/10 bg-gray-900/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <button
            onClick={startNewChat}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            New Assistant Chat
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            Recent Conversations
          </div>

          {isSidebarLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">
              No recent chats
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = sess.id === currentSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => loadSession(sess.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all border ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white font-semibold'
                      : 'border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
                    <span className="truncate text-sm">{sess.title || 'Untitled Conversation'}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(sess.id, e)}
                    className="p-1 rounded-lg text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-gray-950/20">
        {/* Chat Header */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gray-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">HireMind AI Assistant</h3>
              <p className="text-xs text-indigo-400/80 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online & Ready
              </p>
            </div>
          </div>
        </header>

        {/* Message panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            /* Welcome screen with suggestions */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  How can I help you today?
                </h2>
                <p className="text-gray-400 text-sm">
                  I can assist you with your leave requests, clarify company policy, explain your latest payslips, or help you complete onboarding checklists.
                </p>
              </div>

              {/* Suggestions grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {prompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendMessage(p.text)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between text-left group transition-all cursor-pointer"
                    >
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        {p.text}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Message list */
            messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm border shadow-sm ${
                      isAssistant
                        ? 'bg-white/5 border-white/10 rounded-tl-sm text-gray-100'
                        : 'bg-indigo-600 border-indigo-500 rounded-tr-sm text-white'
                    }`}
                  >
                    {isAssistant ? (
                      <div
                        className="prose prose-invert text-gray-200"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10 shrink-0 text-gray-300 font-bold text-xs">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <footer className="p-4 border-t border-white/10 bg-gray-900/10">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about policies, leaves, payslips, or onboarding..."
              rows={1}
              className="w-full pl-4 pr-12 py-3.5 bg-gray-800/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500 text-sm resize-none custom-scrollbar"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AIChatPortal;
