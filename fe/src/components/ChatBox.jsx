import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import './ChatBox.css';

const ChatBox = ({ isOpen, onClose, token, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('ChatBox useEffect - isOpen:', isOpen, 'token exists:', !!token, 'userId:', userId);
    if (isOpen && token && userId) {
      socketService.connect(token, userId);
      socketService.setOnMessageCallback((msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } else {
      console.log('Not connecting: missing token or userId');
      socketService.disconnect();
    }

    return () => {
      socketService.setOnMessageCallback(null);
    };
  }, [isOpen, token, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const room = `chat_${userId}`;
      socketService.sendMessage(room, inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>Chat với hỗ trợ</span>
        <button className="close-btn" onClick={onClose}>
          <i className="bi bi-x"></i>
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.senderRole === "user" ? "user" : "admin"
            }`}
          >
            <div className="message-content">{msg.message}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={handleSendMessage}>
          <i className="bi bi-send"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
