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
        console.log('Socket disconnected:', reason);
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
        setMessages(data.messages || []);
      });

      // Event listener for receiving a new message in real-time.
      newSocket.on('message', (newMessage: IChatMessage) => {
        console.log('Received new message:', newMessage);
        // Add the new message to the existing messages array.
        setMessages((prevMessages) => [...prevMessages, newMessage]);
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
   */
  const sendMessage = (message: string) => {
    if (socketRef.current && isConnected && session?.user?.id) {
      const roomIdentifier = `chat_${session.user.id}`;
      socketRef.current.emit("sendMessage", { room: roomIdentifier, message });
    } else {
      console.error("Socket not connected or user session not found, cannot send message.");
      toast.error("Chưa kết nối với server chat hoặc không tìm thấy phiên đăng nhập.");
    }
  };

  return { socket: socketRef.current, isConnected, messages, setMessages, sendMessage };
};