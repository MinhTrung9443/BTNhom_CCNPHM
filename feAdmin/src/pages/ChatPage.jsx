import React, { useState, useEffect, useRef } from "react";
import socketService from "../services/socketService";
import "./ChatPage.css";

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Assume token is available, e.g., from localStorage
    const token = localStorage.getItem("adminToken");
    if (token) {
      socketService.connect(token);
      socketService.setOnNewOrderCallback(null); // Clear if any

      // Listen for active rooms
      socketService.setOnActiveRoomsCallback((activeRooms) => {
        setRooms(activeRooms);
      });

      // Listen for new room
      socketService.setOnNewRoomCallback(({ room, adminId }) => {
        setRooms((prev) => [...prev, room]);
      });

      // Listen for room closed
      socketService.setOnRoomClosedCallback(({ room }) => {
        setRooms((prev) => prev.filter((r) => r !== room));
        if (selectedRoom === room) {
          setSelectedRoom(null);
          setMessages([]);
        }
      });

      // Fetch initial active rooms
      socketService.getActiveRooms();
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Separate useEffect for message handlers that depend on selectedRoom
  useEffect(() => {
    // Listen for messages
    socketService.setOnMessageCallback((msg) => {
      console.log(
        "Admin received message:",
        msg,
        "selectedRoom:",
        selectedRoom
      );
      if (selectedRoom && msg.room === selectedRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    });

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
      socketService.setOnMessageCallback(null);
      socketService.setOnRoomMessagesCallback(null);
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
          {rooms.map((room) => (
            <li
              key={room}
              className={selectedRoom === room ? "active" : ""}
              onClick={() => handleSelectRoom(room)}
            >
              {room.replace("chat_", "Khách hàng ")}
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
