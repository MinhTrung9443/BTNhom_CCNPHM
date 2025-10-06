import React, { useState, useEffect, useRef } from "react";
import socketService from "../services/socketService";
import { useChatContext } from "../contexts/ChatContext";
import "./ChatPage.css";

const ChatPage = () => {
  const { activeRooms, unreadMessages, markRoomAsRead, refreshActiveRooms } =
    useChatContext();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Clear the global message callback when entering chat page to prevent duplicate notifications
    socketService.setOnNewOrderCallback(null);

    // Set current page indicator
    sessionStorage.setItem("currentChatPage", "true");

    // Refresh active rooms when entering chat page
    refreshActiveRooms();

    return () => {
      // Clear page indicator when leaving
      sessionStorage.removeItem("currentChatPage");
      sessionStorage.removeItem("currentChatRoom");
    };
  }, [refreshActiveRooms]);

  // Separate useEffect for message handlers that depend on selectedRoom
  useEffect(() => {
    if (!selectedRoom) return;

    // Listen for room messages when joining
    socketService.setOnRoomMessagesCallback(({ room, messages: msgs }) => {
      console.log(
        "Admin received room messages:",
        room,
        msgs,
        "selectedRoom:",
        selectedRoom
      );
      if (room === selectedRoom) {
        setMessages(msgs);
      }
    });

    return () => {
      // Clear callbacks when selectedRoom changes or component unmounts
      socketService.setOnRoomMessagesCallback(null);
    };
  }, [selectedRoom]);

  // Listen for individual messages in the selected room
  useEffect(() => {
    if (!selectedRoom) return;

    const handleMessage = (msg) => {
      console.log(
        "ChatPage received message:",
        msg,
        "selectedRoom:",
        selectedRoom
      );
      if (msg.room === selectedRoom) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some(
            (m) => m.timestamp === msg.timestamp && m.message === msg.message
          );
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };

    // Use the socket service's callback system instead of directly accessing socket
    const originalCallback = socketService.socket?.listeners("message")[0];
    socketService.socket?.on("message", handleMessage);

    return () => {
      socketService.socket?.off("message", handleMessage);
    };
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]);
    socketService.joinRoom(room);

    // Mark room as read
    markRoomAsRead(room);

    // Set current room indicator
    sessionStorage.setItem("currentChatRoom", room);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedRoom) {
      socketService.sendMessage(selectedRoom, inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="rooms-list">
        <h4>Phòng chat</h4>
        <ul>
          {activeRooms.map((room) => (
            <li
              key={room}
              className={selectedRoom === room ? "active" : ""}
              onClick={() => handleSelectRoom(room)}
            >
              {room.replace("chat_", "Khách hàng ")}
              {unreadMessages[room] && unreadMessages[room] > 0 && (
                <span className="unread-badge">{unreadMessages[room]}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-area">
        {selectedRoom ? (
          <>
            <div className="chat-header">
              <h5>{selectedRoom.replace("chat_", "Chat với khách hàng ")}</h5>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.senderRole === "admin" ? "admin" : "user"
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
          </>
        ) : (
          <div className="no-room">Chọn một phòng chat để bắt đầu</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
