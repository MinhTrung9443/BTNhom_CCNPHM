import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.onMessageCallback = null;
    this.userId = null;
  }

  connect(token, userId) {
    this.userId = userId;
    if (this.socket && this.isConnected) {
      return;
    }

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    this.socket = io(backendUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("user connected to WebSocket server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("user disconnected from WebSocket server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      console.error("Error details:", error.message, error);
      this.isConnected = false;
    });

    // Listen for messages
    this.socket.off("message");
    this.socket.on("message", (msg) => {
      console.log("Received message:", msg);
      if (this.onMessageCallback) {
        this.onMessageCallback(msg);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  sendMessage(room, message) {
    console.log('Sending message to room:', room, 'message:', message, 'isConnected:', this.isConnected);
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', { room, message });
    } else {
      console.error('Cannot send message: socket not connected');
    }
  }

  setOnMessageCallback(callback) {
    this.onMessageCallback = callback;
  }

  // Method to manually emit events if needed
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;
