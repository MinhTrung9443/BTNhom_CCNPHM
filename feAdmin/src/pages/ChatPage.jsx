import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import socketService from "../services/socketService";
import { useChatContext } from "../contexts/ChatContext";
import { Form, Image, Button, Spinner } from "react-bootstrap";
import moment from "moment";
import "./ChatPage.css";
import OrderReferenceCard from "../components/common/OrderReferenceCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ChatPage = () => {
  const { usersForChat, chatPagination, isFetchingUsers, loadMoreUsers, refreshUserList, searchUsers, unreadMessages, markRoomAsRead } = useChatContext();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousMessagesLengthRef = useRef(0);
  const shouldScrollToBottomRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const hasScrolledToBottomRef = useRef(false);
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
      if (room === selectedRoom) {
        setMessages(msgs);
        setHasMoreMessages(msgs.length >= 10); // Nếu nhận đủ 10 tin nhắn, có thể còn tin cũ hơn
        
        // Scroll to bottom immediately after receiving initial messages
        if (msgs.length > 0) {
          shouldScrollToBottomRef.current = true;
          // Multiple timeouts to ensure scroll happens after DOM update
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              lastScrollTopRef.current = messagesContainerRef.current.scrollTop;
            }
          }, 50);
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              lastScrollTopRef.current = messagesContainerRef.current.scrollTop;
              hasScrolledToBottomRef.current = true;
            }
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            // Sau khi scroll xong, set flag để cho phép load older messages
            setTimeout(() => {
              isInitialLoadRef.current = false;
            }, 300);
          }, 150);
        }
      }
    };
    socketService.setOnRoomMessagesCallback(handleRoomMessages);

    const handleOlderMessages = ({ room, messages: olderMsgs }) => {
      if (room === selectedRoom) {
        // Đảm bảo loading tối thiểu 1 giây
        const loadStartTime = window.__loadStartTime || Date.now();
        const minLoadingTime = 1000; // 1 giây
        const elapsedTime = Date.now() - loadStartTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        setTimeout(() => {
          // Lưu scroll height và position trước khi thêm tin nhắn
          const container = messagesContainerRef.current;
          const previousScrollHeight = container?.scrollHeight || 0;
          const previousScrollTop = container?.scrollTop || 0;
          
          shouldScrollToBottomRef.current = false; // Không scroll xuống cuối
          setMessages((prev) => [...olderMsgs, ...prev]);
          setHasMoreMessages(olderMsgs.length >= 5);
          
          // Khôi phục vị trí scroll sau khi render
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              const heightDifference = newScrollHeight - previousScrollHeight;
              // Giữ vị trí scroll tương đối bằng cách cộng thêm phần tăng lên
              container.scrollTop = previousScrollTop + heightDifference;
            }
            shouldScrollToBottomRef.current = true;
            setIsLoadingOlderMessages(false);
          }, 0);
        }, remainingTime);
      }
    };
    socketService.setOnOlderMessagesCallback(handleOlderMessages);

    const handleMessage = (msg) => {
      if (msg.room === selectedRoom) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
      // Luôn cập nhật lại danh sách user để cột bên trái hiển thị đúng preview
      refreshUserList(searchQuery);
    };
    socketService.socket?.on("message", handleMessage);

    return () => {
      socketService.setOnRoomMessagesCallback(null);
      socketService.setOnOlderMessagesCallback(null);
      socketService.socket?.off("message", handleMessage);
    };
  }, [selectedRoom, searchQuery]);

  useEffect(() => {
    // Chỉ scroll xuống cuối khi:
    // 1. Có tin nhắn mới (messages.length tăng và không phải do load older messages)
    // 2. shouldScrollToBottomRef.current = true
    if (shouldScrollToBottomRef.current && messages.length > previousMessagesLengthRef.current) {
      scrollToBottom();
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  const scrollToBottom = (instant = false) => {
    if (instant) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUser?._id === user._id) return;
    setSelectedUser(user);
    setMessages([]);
    setHasMoreMessages(true);
    shouldScrollToBottomRef.current = true; // Reset về true khi chọn user mới
    previousMessagesLengthRef.current = 0;
    lastScrollTopRef.current = 0; // Reset scroll position tracking
    isInitialLoadRef.current = true; // Reset initial load flag
    hasScrolledToBottomRef.current = false; // Reset scroll to bottom flag
    const roomName = `chat_${user._id}`;
    socketService.joinRoom(roomName);
    markRoomAsRead(roomName);
    sessionStorage.setItem("currentChatRoom", roomName);
  };

  const loadOlderMessages = () => {
    if (!selectedRoom || messages.length === 0 || isLoadingOlderMessages || !hasMoreMessages) return;
    
    setIsLoadingOlderMessages(true);
    // Lưu thời điểm bắt đầu load
    window.__loadStartTime = Date.now();
    const oldestMessage = messages[0];
    socketService.getOlderMessages(selectedRoom, oldestMessage.timestamp);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const currentScrollTop = scrollTop;
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Chỉ load tin nhắn cũ khi:
    // 1. Đã scroll xuống bottom ít nhất 1 lần (để đảm bảo initial load hoàn tất)
    // 2. Đang scroll lên (không phải xuống)
    // 3. Gần đến đầu (scrollTop < 100)
    // 4. Không đang load
    // 5. Còn tin nhắn cũ hơn
    // 6. Không phải lần load đầu tiên
    // 7. Không ở quá gần bottom (tránh trigger khi vừa scroll xuống xong)
    if (
      hasScrolledToBottomRef.current &&
      isScrollingUp &&
      scrollTop < 100 &&
      distanceFromBottom > 50 &&
      !isLoadingOlderMessages &&
      hasMoreMessages &&
      !isInitialLoadRef.current
    ) {
      loadOlderMessages();
    }
    
    lastScrollTopRef.current = currentScrollTop;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers(searchQuery);
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

  // Không cần filter ở frontend nữa vì đã có backend search
  const filteredUsers = usersForChat;

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
          <Form onSubmit={handleSearch} className="mb-3">
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm">
                <i className="bi bi-search"></i>
              </Button>
              {searchQuery && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    refreshUserList("");
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              )}
            </div>
          </Form>
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
            <Button variant="link" onClick={() => loadMoreUsers(searchQuery)} disabled={isFetchingUsers}>
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
            <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
              {isLoadingOlderMessages && (
                <div className="loading-older-messages">
                  <div className="d-flex align-items-center justify-content-center gap-2 py-3">
                    <Spinner animation="border" size="sm" variant="primary" />
                    <span className="small text-muted">Đang tải tin nhắn cũ...</span>
                  </div>
                  {/* Skeleton loading messages */}
                  <div className="skeleton-messages">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`skeleton-message ${i % 2 === 0 ? 'skeleton-admin' : 'skeleton-user'}`}>
                        <div className="skeleton-content"></div>
                        <div className="skeleton-time"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={msg._id || index} className={`message ${msg.senderRole === "admin" ? "admin" : "user"}`}>
                  <div className="message-content">{msg.message}</div>
                  {msg.orderReference && (
                    <div className="mt-2">
                      <OrderReferenceCard orderReference={msg.orderReference} />
                    </div>
                  )}
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
