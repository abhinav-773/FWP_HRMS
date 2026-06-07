import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import axiosClient from '../services/axiosClient';

export const useTeamChat = (conversationId) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial messages for the conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const response = await axiosClient.get(`/team-chat/${conversationId}/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join the socket room for this specific conversation
    socket.emit('join_conversation', conversationId);

    const handleNewMessage = (message) => {
      // Only append if it belongs to current conversation
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, conversationId]);

  const sendMessage = async (content) => {
    try {
      // We rely on the REST API to save it. The socket event will broadcast it back to us and others.
      // Optimistic UI update could be added here if needed, but standard socket echoing is simpler for now.
      await axiosClient.post(`/team-chat/${conversationId}/messages`, { content });
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  return { messages, loading, sendMessage, refresh: fetchMessages };
};
