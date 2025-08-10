import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, LogOut, MessageCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../../frontend/src/index.css'; // Make sure this path matches your file structure

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user, logout } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const message = inputMessage.trim();
    if (!message || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const loadingMessage = {
      id: Date.now() + 1,
      role: 'ai',
      content: 'Thinking...',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await axios.post('/api/chat', {
        message,
        conversationHistory
      });

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? {
                ...msg,
                content: response.data.response,
                loading: false
              }
            : msg
        )
      );

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      const errorMessage = error.response?.data?.message || 'Failed to get AI response';
      toast.error(errorMessage);

      const aiErrorMessage = {
        id: Date.now() + 2,
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      };

      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

return (
  <div className="chat-container">
    {/* Header */}
    <div className="chat-header">
      <span className="chat-title">
        <MessageCircle size={20} style={{ marginRight: '0.4rem' }} />
        <span>Chat with Suri's AI</span>
      </span>

      <div className="chat-user">
        <span className="welcome-text">
          Welcome, {user?.email?.replace('@gmail.com', '')}
        </span>
        <button onClick={handleLogout} className="logout-button">
          <LogOut size={14} style={{ marginRight: '0.4rem' }} />
          Logout
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Start a conversation</h3>
          <p>Send a message to begin chatting with AI</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role} ${message.loading ? 'loading' : ''}`}
          >
            {message.loading ? (
              <>
                <div className="loading-spinner"></div>
                {message.content}
              </>
            ) : (
              <div className="message-row">
                <span className="message-text">{message.content}</span>
                <span className="timestamp">{formatTime(message.timestamp)}</span>
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* Input */}
    <div className="chat-input-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="chat-input-form"
      >
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="chat-input"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!inputMessage.trim() || isLoading}
        >
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  </div>
);

};

export default Chat;
