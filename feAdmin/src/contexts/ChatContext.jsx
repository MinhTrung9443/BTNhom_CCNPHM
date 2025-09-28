import React, { createContext, useContext, useState, useEffect } from "react";
import socketService from "../services/socketService";
import { toast } from "react-toastify";

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize chat listeners once when provider mounts
  useEffect(() => {
    if (!isInitialized) {
      setupChatListeners();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const setupChatListeners = () => {
    // Load unread counts from localStorage initially
    const savedUnread = JSON.parse(
      localStorage.getItem("chatUnreadCounts") || "{}"
    );
    setUnreadMessages(savedUnread);

    // Listen for active rooms
    socketService.setOnActiveRoomsCallback((rooms) => {
      console.log("Received active rooms:", rooms);
      setActiveRooms(rooms);
    });

    // Listen for new room
    socketService.setOnNewRoomCallback(({ room, userId }) => {
      console.log("New chat room created:", room);
      setActiveRooms((prev) => {
        if (!prev.includes(room)) {
          // Show notification for new chat room
          toast.info(
            `Khách hàng mới bắt đầu chat: ${room.replace("chat_", "")}`,
            {
              position: "top-right",
              autoClose: 5000,
              onClick: () => {
                window.location.href = "/chat";
              },
            }
          );
          return [...prev, room];
        }
        return prev;
      });
    });

    // Listen for room closed
    socketService.setOnRoomClosedCallback(({ room }) => {
      console.log("Chat room closed:", room);
      setActiveRooms((prev) => prev.filter((r) => r !== room));

      // Remove unread count for closed room
      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[room];
        localStorage.setItem("chatUnreadCounts", JSON.stringify(updated));
        return updated;
      });
    });

    // Listen for new messages globally
    socketService.setOnMessageCallback((msg) => {
      console.log("Global message received:", msg);

      // Only count as unread if not currently on chat page or not in the specific room
      const isOnChatPage = window.location.pathname === "/chat";
      const currentRoom = sessionStorage.getItem("currentChatRoom");

      if (!isOnChatPage || currentRoom !== msg.room) {
        // Increment unread count
        setUnreadMessages((prev) => {
          const updated = {
            ...prev,
            [msg.room]: (prev[msg.room] || 0) + 1,
          };
          localStorage.setItem("chatUnreadCounts", JSON.stringify(updated));
          return updated;
        });

        // Show notification if not on chat page
        if (!isOnChatPage) {
          const customerName = msg.room.replace("chat_", "Khách hàng ");
          toast.info(`Tin nhắn mới từ ${customerName}: ${msg.message}`, {
            position: "top-right",
            autoClose: 5000,
            onClick: () => {
              window.location.href = "/chat";
            },
          });
        }
      }
    });

    // Delay fetching active rooms to ensure socket is connected
    setTimeout(() => {
      console.log("Fetching initial active rooms...");
      socketService.getActiveRooms();
    }, 1000);
  };

  const markRoomAsRead = (room) => {
    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[room];
      localStorage.setItem("chatUnreadCounts", JSON.stringify(updated));
      return updated;
    });
  };

  const getTotalUnreadCount = () => {
    return Object.values(unreadMessages).reduce(
      (total, count) => total + count,
      0
    );
  };

  const refreshActiveRooms = () => {
    console.log("Manually refreshing active rooms...");
    socketService.getActiveRooms();
  };

  const value = {
    activeRooms,
    unreadMessages,
    markRoomAsRead,
    getTotalUnreadCount,
    refreshActiveRooms,
    setActiveRooms,
    setUnreadMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
