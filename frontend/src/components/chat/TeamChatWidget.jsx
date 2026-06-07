import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Users, Send, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamChat } from '../../hooks/useTeamChat';
import axiosClient from '../../services/axiosClient';
import { useSelector } from 'react-redux';

const TeamChatWidget = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [inputText, setInputText] = useState('');
  
  const { messages, loading, sendMessage, refresh } = useTeamChat(activeConversationId);
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    if (isOpen && !activeConversationId) {
      fetchConversations();
    }
  }, [isOpen, activeConversationId]);

  const fetchConversations = async () => {
    try {
      const res = await axiosClient.get('/team-chat');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  // Start a new 1-on-1 chat (for MVP, we'll list some users to chat with, or just show existing chats)
  // In a full implementation, you'd have a directory to pick a user from.

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    try {
      await sendMessage(inputText);
      setInputText('');
    } catch (err) {}
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform z-50 group"
      >
        <MessageSquare className="text-gray-400 group-hover:text-white h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 w-80 h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gray-800/80 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-white">
                <Users className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold">{activeConversationId ? 'Chat' : 'Team Messages'}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {activeConversationId && (
                  <button onClick={() => setActiveConversationId(null)} className="text-xs text-gray-400 hover:text-white">
                    Back
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-gray-900/50">
              {!activeConversationId ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm mt-10">
                      No conversations yet.
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <div 
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className="p-3 mb-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-600"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-white">
                            {conv.isGroup ? conv.name : conv.participants.map(p => p.user.fullName).join(', ')}
                          </h4>
                        </div>
                        {conv.messages && conv.messages[0] && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {conv.messages[0].content}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {loading ? (
                      <div className="text-center text-gray-500 text-sm mt-4">Loading...</div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === currentUser?.id;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="text-[10px] text-gray-500 mb-1">{msg.sender.fullName}</div>
                            <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm'}`}>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-3 bg-gray-800 border-t border-gray-700">
                    <form onSubmit={handleSend} className="flex space-x-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        type="submit"
                        disabled={!inputText.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeamChatWidget;
