import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ChatAPI } from '../api/chat.api';
import { UserReportsAPI } from '../api/reports.api';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessageResponse, SendMessageRequest } from '../types/api.types';
import toast from 'react-hot-toast';

interface ReportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: number;
  targetUserId: number;
  targetUserName: string;
  conversationId?: string;
}

export default function ReportChatModal({
  isOpen,
  onClose,
  reportId,
  targetUserId,
  targetUserName,
  conversationId: initialConversationId,
}: ReportChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Generate conversation ID if not provided
  useEffect(() => {
    if (!conversationId && user?.userId && targetUserId) {
      const generatedId = ChatAPI.generateReportConversationId(
        reportId,
        user.userId,
        targetUserId
      );
      setConversationId(generatedId);
    }
  }, [conversationId, user?.userId, targetUserId, reportId]);

  // Load messages
  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const fetchedMessages = await ChatAPI.getMessagesByConversationId(conversationId);
      setMessages(fetchedMessages);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      // If conversation doesn't exist yet, that's okay - it will be created on first message
      if (error.status !== 404) {
        toast.error(error.message || 'Không thể tải tin nhắn');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load messages when modal opens or conversationId changes
  useEffect(() => {
    if (isOpen && conversationId) {
      loadMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.userId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);

      // Try to send message directly first
      const sendRequest: SendMessageRequest = {
        receiverId: targetUserId,
        reportId,
        messageType: 'TEXT',
        content: messageContent,
      };

      try {
        const sentMessage = await ChatAPI.sendMessage(sendRequest);
        setMessages((prev) => [...prev, sentMessage]);
        // Update conversationId if it wasn't set
        if (!conversationId && sentMessage.conversationId) {
          setConversationId(sentMessage.conversationId);
        }
      } catch (sendError: any) {
        // If sending fails and no messages exist, try starting chat
        if (messages.length === 0 && sendError.status === 404) {
          try {
            await UserReportsAPI.startChat(reportId, {
              targetUserId,
              initialMessage: messageContent,
            });
            // Reload messages after starting chat
            await loadMessages();
          } catch (startError: any) {
            console.error('Error starting chat:', startError);
            toast.error(startError.message || 'Không thể bắt đầu chat');
            setNewMessage(messageContent); // Restore message on error
          }
        } else {
          throw sendError;
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Không thể gửi tin nhắn');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (!isOpen) return null;

  const isCurrentUser = (senderId: number) => senderId === user?.userId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {targetUserName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{targetUserName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
          style={{ scrollBehavior: 'smooth' }}
        >
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => {
                const isUser = isCurrentUser(message.senderId);
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                return (
                  <motion.div
                    key={message.messageId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {showAvatar && !isUser && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {message.senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {showAvatar && isUser && <div className="w-8 flex-shrink-0" />}

                    {/* Message Bubble */}
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {showAvatar && !isUser && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                          {message.senderName}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isUser
                            ? 'bg-blue-500 text-white rounded-tr-sm'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
                        } shadow-sm`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                        {formatTime(message.sentAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none overflow-hidden"
              style={{ maxHeight: '120px' }}
              disabled={sending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

