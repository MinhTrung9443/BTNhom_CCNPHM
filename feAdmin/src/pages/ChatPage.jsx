import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import socketService from "../services/socketService";
import { useChatContext } from "../contexts/ChatContext";
import { Form, Image, Button, Spinner } from "react-bootstrap";
import moment from "moment";
import "./ChatPage.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ChatPage = () => {
  const { usersForChat, chatPagination, isFetchingUsers, loadMoreUsers, refreshUserList, unreadMessages, markRoomAsRead } = useChatContext();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const query = useQuery();

  const selectedRoom = useMemo(() => {
    return selectedUser ? `chat_${selectedUser._id}` : null;
  }, [selectedUser]);

  useEffect(() => {
    sessionStorage.setItem("currentChatPage", "true");
    refreshUserList(); // Use refresh to ensure a clean state on mount

    return () => {
      sessionStorage.removeItem("currentChatPage");
      sessionStorage.removeItem("currentChatRoom");
    };
  }, []); // refreshUserList is stable from useCallback

  useEffect(() => {
    const userIdFromQuery = query.get("userId");
    if (userIdFromQuery && usersForChat.length > 0) {
      const userToSelect = usersForChat.find((u) => u._id === userIdFromQuery);
      if (userToSelect) {
        handleSelectUser(userToSelect);
      }
    }
  }, [query, usersForChat]);

  useEffect(() => {
    if (!selectedRoom) return;

    const handleRoomMessages = ({ room, messages: msgs }) => {
      if (room === selectedRoom) setMessages(msgs);
    };
    socketService.setOnRoomMessagesCallback(handleRoomMessages);

    const handleMessage = (msg) => {
      if (msg.room === selectedRoom) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
      // Luôn cập nhật lại danh sách user để cột bên trái hiển thị đúng preview
      refreshUserList();
    };
    socketService.socket?.on("message", handleMessage);

    return () => {
      socketService.setOnRoomMessagesCallback(null);
      socketService.socket?.off("message", handleMessage);
    };
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectUser = (user) => {
    if (selectedUser?._id === user._id) return;
    setSelectedUser(user);
    setMessages([]);
    const roomName = `chat_${user._id}`;
    socketService.joinRoom(roomName);
    markRoomAsRead(roomName);
    sessionStorage.setItem("currentChatRoom", roomName);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedRoom) {
      socketService.sendMessage(selectedRoom, inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return usersForChat;
    return usersForChat.filter(
      (user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usersForChat, searchQuery]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const now = moment();
    const msgTime = moment(timestamp);
    if (now.isSame(msgTime, "day")) return msgTime.format("HH:mm");
    if (now.isSame(msgTime, "week")) return msgTime.format("ddd");
    return msgTime.format("DD/MM");
  };

  return (
    <div className="chat-page">
      <div className="rooms-list">
        <div className="chat-list-header">
          <h4>Danh sách khách hàng</h4>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />
        </div>
        <ul className="user-list-container">
          {filteredUsers.map((user) => {
            const roomName = `chat_${user._id}`;
            const unreadCount = unreadMessages[roomName] || 0;
            return (
              <li
                key={user._id}
                className={`user-list-item ${selectedUser?._id === user._id ? "active" : ""}`}
                onClick={() => handleSelectUser(user)}
              >
                <Image
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  roundedCircle
                  width={40}
                  height={40}
                  className="me-3"
                />
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className={`last-message ${unreadCount > 0 ? "fw-bold" : ""}`}>
                    {user.lastMessage
                      ? user.lastMessage.length > 25
                        ? `${user.lastMessage.substring(0, 25)}...`
                        : user.lastMessage
                      : "Chưa có tin nhắn"}
                  </div>
                </div>
                <div className="message-meta">
                  <div className="message-time">{formatTimestamp(user.lastMessageTimestamp)}</div>
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        {chatPagination.hasMore && (
          <div className="text-center mt-2">
            <Button variant="link" onClick={loadMoreUsers} disabled={isFetchingUsers}>
              {isFetchingUsers ? <Spinner as="span" animation="border" size="sm" /> : "Xem thêm"}
            </Button>
          </div>
        )}
      </div>
      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h5>{`Chat với ${selectedUser.name}`}</h5>
              <span>{selectedUser.email}</span>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={msg._id || index} className={`message ${msg.senderRole === "admin" ? "admin" : "user"}`}>
                  <div className="message-content">{msg.message}</div>
                  <div className="message-time">{msg.timestamp ? moment(msg.timestamp).format("HH:mm") : ""}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <Form.Control
                as="textarea"
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                <i className="bi bi-send"></i>
              </button>
            </div>
          </>
        ) : (
          <div className="no-room">
            <i className="bi bi-wechat" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">Chọn một khách hàng để bắt đầu trò chuyện</h4>
            <p>Bạn có thể tìm kiếm và chọn khách hàng từ danh sách bên trái hoặc được điều hướng từ trang khác.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
