import React, { useState } from 'react';
import './ChatIcon.css'; // We'll create this for styling

const ChatIcon = ({ onClick }) => {
  return (
    <div className="chat-icon" onClick={onClick}>
      <i className="bi bi-chat-dots"></i>
    </div>
  );
};

export default ChatIcon;
