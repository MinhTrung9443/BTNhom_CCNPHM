import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';
import { toast } from 'sonner';

/**
 * Represents a single chat message.
 */
export interface IChatMessage {
  _id: string;
  sender: string | null; // User ID of the sender
  senderRole: 'user' | 'admin';
  message: string;
  room: string; // The room identifier (e.g., 'chat_...')
  timestamp: string; // ISO 8601 date string
  orderReference?: {
    orderId: {
      _id: string;
      orderCode: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      orderLines?: Array<{
        productName: string;
        productImage: string;
        quantity: number;
      }>;
    } | null;
    orderCode: string;
  } | null;
}

/**
 * Custom hook to manage the Socket.IO connection for the chat.
 * It handles connection, disconnection, receiving messages, and sending messages.
 *
 * @returns An object containing:
 * - `socket`: The current socket instance.
 * - `isConnected`: A boolean indicating the connection status.
 * - `messages`: An array of chat messages for the current room.
 * - `setMessages`: A function to manually update the messages array.
 * - `sendMessage`: A function to send a new message.
 */
export const useSocket = () => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only attempt to connect when the session is authenticated and has a valid token.
    if (status === 'authenticated' && session?.user?.accessToken) {
      console.log("Session authenticated, attempting to connect socket...");

      // Disconnect any existing socket before creating a new one.
      // This is important for handling token refreshes or user changes.
      if (socketRef.current) {
        console.log("Disconnecting existing socket before reconnecting...");
        socketRef.current.disconnect();
      }

      // The backend URL for the socket server.
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

      const newSocket = io(backendUrl, {
        // Send the authentication token in the handshake.
        auth: {
          token: session.user.accessToken,
        },
        transports: ["websocket", "polling"],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        // Only log if it's an unexpected disconnect
        if (reason !== 'io client disconnect') {
          console.log('Socket disconnected:', reason);
        }
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // This happens when the server forcefully disconnects the client (e.g., auth error).
          toast.error("Mất kết nối với chat server.");
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
        if (error.message.includes('Authentication error')) {
          toast.error("Lỗi xác thực khi kết nối chat.");
        } else {
          toast.error("Không thể kết nối đến chat server.");
        }
      });

      // Event listener for receiving the initial batch of messages for the room.
      newSocket.on('roomMessages', (data: { messages: IChatMessage[] }) => {
        console.log('Received initial room messages:', data);
        const msgs = data.messages || [];
        setMessages(msgs);
        setHasMoreMessages(msgs.length >= 10); // Nếu nhận đủ 10 tin nhắn, có thể còn tin cũ hơn
      });

      // Event listener for receiving older messages (lazy loading).
      newSocket.on('olderMessages', (data: { room: string; messages: IChatMessage[] }) => {
        console.log('Received older messages:', data);
        
        // Lưu scroll position trước khi thêm tin nhắn
        const container = scrollContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;
        const previousScrollTop = container?.scrollTop || 0;
        
        // Đảm bảo loading tối thiểu 1 giây để hiệu ứng mượt mà
        const loadStartTime = (window as any).__loadStartTime || Date.now();
        const minLoadingTime = 1000; // 1 giây
        const elapsedTime = Date.now() - loadStartTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        setTimeout(() => {
          setMessages((prevMessages) => [...data.messages, ...prevMessages]);
          setHasMoreMessages(data.messages.length >= 5); // Nếu nhận đủ 5 tin nhắn, có thể còn tin cũ hơn
          setIsLoadingOlderMessages(false);
          
          // Khôi phục scroll position sau khi render
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              const addedHeight = newScrollHeight - previousScrollHeight;
              container.scrollTop = previousScrollTop + addedHeight;
            }
          }, 0);
        }, remainingTime);
      });

      // Event listener for receiving a new message in real-time.
      newSocket.on('message', (newMessage: IChatMessage) => {
        console.log('Received new message:', newMessage);
        
        setMessages((prevMessages) => {
          // Check if this is our own message (optimistic update)
          const tempMessageIndex = prevMessages.findIndex(
            msg => msg._id.startsWith('temp_') && 
            msg.senderRole === 'user' && 
            msg.message === newMessage.message
          );
          
          if (tempMessageIndex !== -1 && newMessage.senderRole === 'user') {
            // This is our message coming back from server
            // Keep the temp message but update its ID and merge orderReference data
            const tempMessage = prevMessages[tempMessageIndex];
            const updatedMessage: IChatMessage = {
              ...tempMessage,
              _id: newMessage._id, // Use real ID from server
              timestamp: newMessage.timestamp, // Use real timestamp
              // Keep orderReference from temp message if it has more details
              orderReference: tempMessage.orderReference?.orderId ? tempMessage.orderReference : newMessage.orderReference,
            };
            
            // Replace temp message with updated one
            const newMessages = [...prevMessages];
            newMessages[tempMessageIndex] = updatedMessage;
            return newMessages;
          }
          
          // This is a message from someone else (admin), just add it
          return [...prevMessages, newMessage];
        });
      });

      // Store the new socket instance in the ref.
      socketRef.current = newSocket;

    } else if (status === 'unauthenticated') {
      // If the user is logged out, ensure any existing socket connection is closed.
      if (socketRef.current) {
        console.log("User is unauthenticated, disconnecting socket.");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    }

    // The cleanup function for the useEffect hook.
    return () => {
      if (socketRef.current) {
        console.log("useSocket cleanup: Disconnecting socket.");
        // It's crucial to remove listeners to prevent memory leaks.
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('roomMessages');
        socketRef.current.off('olderMessages');
        socketRef.current.off('message');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  // This effect should re-run whenever the session status or the access token changes.
  }, [status, session?.user?.accessToken]);

  /**
   * Sends a message to the chat server.
   * The message is sent to the user's dedicated room.
   * @param message The content of the message to send.
   * @param orderReference Optional order reference to attach to the message.
   * @param orderDetails Optional full order details for optimistic UI update.
   */
  const sendMessage = (
    message: string, 
    orderReference?: { orderId: string; orderCode: string },
    orderDetails?: any
  ) => {
    if (socketRef.current && isConnected && session?.user?.id) {
      const roomIdentifier = `chat_${session.user.id}`;
      
      // Optimistic update: Add message to UI immediately
      const optimisticMessage: IChatMessage = {
        _id: `temp_${Date.now()}`, // Temporary ID
        sender: session.user.id,
        senderRole: 'user',
        message,
        room: roomIdentifier,
        timestamp: new Date().toISOString(),
        orderReference: orderReference && orderDetails ? {
          orderId: {
            _id: orderDetails._id,
            orderCode: orderDetails.orderCode,
            totalAmount: orderDetails.totalAmount,
            status: orderDetails.status,
            createdAt: orderDetails.createdAt,
            orderLines: orderDetails.orderLines,
          },
          orderCode: orderReference.orderCode,
        } : undefined,
      };
      
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      
      // Send to server
      socketRef.current.emit("sendMessage", { 
        room: roomIdentifier, 
        message,
        orderReference: orderReference || null
      });
    } else {
      console.error("Socket not connected or user session not found, cannot send message.");
      toast.error("Chưa kết nối với server chat hoặc không tìm thấy phiên đăng nhập.");
    }
  };

  /**
   * Loads older messages for lazy loading.
   * @param beforeTimestamp The timestamp to load messages before.
   */
  const loadOlderMessages = (beforeTimestamp: string) => {
    if (socketRef.current && isConnected && session?.user?.id && !isLoadingOlderMessages && hasMoreMessages) {
      const roomIdentifier = `chat_${session.user.id}`;
      setIsLoadingOlderMessages(true);
      // Lưu thời điểm bắt đầu load
      (window as any).__loadStartTime = Date.now();
      socketRef.current.emit("getOlderMessages", { roomIdentifier, before: beforeTimestamp });
    }
  };

  return { 
    socket: socketRef.current, 
    isConnected, 
    messages, 
    setMessages, 
    sendMessage,
    loadOlderMessages,
    isLoadingOlderMessages,
    hasMoreMessages,
    scrollContainerRef
  };
};