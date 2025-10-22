import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import socketService from "../services/socketService";
import adminService from "../services/adminService";
import { toast } from "react-toastify";

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

const CHAT_USER_PAGE_LIMIT = 6;

export const ChatProvider = ({ children }) => {
  const [usersForChat, setUsersForChat] = useState([]);
  const [chatPagination, setChatPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    hasMore: true,
  });
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  const [unreadMessages, setUnreadMessages] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUsersForChat = useCallback(async (page = 1, refresh = false) => {
    if (isFetchingUsers) return;
    setIsFetchingUsers(true);

    try {
      const response = await adminService.getUsersForChat({ page, limit: CHAT_USER_PAGE_LIMIT });
      const { data, pagination } = response.data;

      if (refresh) {
        setUsersForChat(data);
      } else {
        // Append new users, avoiding duplicates
        setUsersForChat(prev => {
          const existingIds = new Set(prev.map(u => u._id));
          const newUsers = data.filter(u => !existingIds.has(u._id));
          return [...prev, ...newUsers];
        });
      }
      
      setChatPagination({
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        hasMore: pagination.currentPage < pagination.totalPages,
      });

    } catch (error) {
      console.error("Failed to fetch users for chat:", error);
      toast.error("Không thể tải danh sách người dùng để chat.");
    } finally {
      setIsFetchingUsers(false);
    }
  }, [isFetchingUsers]);

  const loadMoreUsers = useCallback(() => {
    if (chatPagination.hasMore && !isFetchingUsers) {
      fetchUsersForChat(chatPagination.currentPage + 1);
    }
  }, [chatPagination, isFetchingUsers, fetchUsersForChat]);

  const refreshUserList = useCallback(() => {
    setUsersForChat([]);
    setChatPagination({ currentPage: 0, totalPages: 1, hasMore: true });
    fetchUsersForChat(1, true);
  }, [fetchUsersForChat]);

  useEffect(() => {
    if (!isInitialized) {
      const initWhenReady = () => {
        if (socketService.isConnected) {
          setupChatListeners();
          fetchUsersForChat(1, true); // Initial fetch
          setIsInitialized(true);
        } else {
          setTimeout(initWhenReady, 300);
        }
      };
      initWhenReady();
    }
  }, [isInitialized, fetchUsersForChat]);

  const setupChatListeners = () => {
    const savedUnread = JSON.parse(localStorage.getItem("chatUnreadCounts") || "{}");
    setUnreadMessages(savedUnread);

    socketService.setOnNewRoomCallback(() => {
      toast.info("Có khách hàng mới bắt đầu chat!");
      refreshUserList();
    });

    socketService.setOnMessageCallback((msg) => {
      const isOnChatPage = window.location.pathname === "/chat";
      const currentRoom = sessionStorage.getItem("currentChatRoom");

      if (!isOnChatPage || currentRoom !== msg.room) {
        setUnreadMessages((prev) => {
          const updated = { ...prev, [msg.room]: (prev[msg.room] || 0) + 1 };
          localStorage.setItem("chatUnreadCounts", JSON.stringify(updated));
          return updated;
        });
      }
    });
  };

  const markRoomAsRead = useCallback((room) => {
    setUnreadMessages((prev) => {
      if (!prev[room]) return prev;
      const updated = { ...prev };
      delete updated[room];
      localStorage.setItem("chatUnreadCounts", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getTotalUnreadCount = useCallback(() => {
    return Object.values(unreadMessages).reduce((total, count) => total + count, 0);
  }, [unreadMessages]);

  const value = {
    usersForChat,
    chatPagination,
    isFetchingUsers,
    loadMoreUsers,
    refreshUserList,
    unreadMessages,
    markRoomAsRead,
    getTotalUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
