import { io } from "socket.io-client";
import { toast } from "react-toastify";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.onNewOrderCallback = null;
    this.lastToastTime = 0;
  }

  connect(token) {
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
      console.log("Connected to WebSocket server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.isConnected = false;
    });

    // Listen for new order notifications (remove existing listener to prevent duplicates)
    this.socket.off("newOrder");
    this.socket.on("newOrder", (orderData) => {
      console.log("New order received:", orderData);
      this.handleNewOrderNotification(orderData);
      if (this.onNewOrderCallback) {
        this.onNewOrderCallback(orderData);
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

  handleNewOrderNotification(orderData) {
    const now = Date.now();
    if (this.lastToastTime && now - this.lastToastTime < 2000) { 
      console.log('Ignoring duplicate new order notification');
      return;
    }
    this.lastToastTime = now;

    const message = `Đơn hàng mới: #${orderData.orderId.slice(-8)} - ${
      orderData.orderLines
    } sản phẩm - ${new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(orderData.totalAmount)}`;

    toast.info(message, {
      position: "bottom-right",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      onClick: () => {
        window.location.href = `/notifications`;
      },
    });


  }

  setOnNewOrderCallback(callback) {
    this.onNewOrderCallback = callback;
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  getActiveRooms() {
    this.emit('getActiveRooms');
  }

  // Chat methods
  joinRoom(room) {
    this.emit('joinRoom', room);
  }

  leaveRoom(room) {
    this.emit('leaveRoom', room);
  }

  sendMessage(room, message) {
    this.emit('sendMessage', { room, message });
  }

  setOnMessageCallback(callback) {
    if (this.socket) {
      this.socket.off('message');
      this.socket.on('message', callback);
    }
  }

  setOnActiveRoomsCallback(callback) {
    if (this.socket) {
      this.socket.off('activeChatRooms');
      this.socket.on('activeChatRooms', callback);
    }
  }

  setOnNewRoomCallback(callback) {
    if (this.socket) {
      this.socket.off('newChatRoom');
      this.socket.on('newChatRoom', callback);
    }
  }

  setOnRoomClosedCallback(callback) {
    if (this.socket) {
      this.socket.off('chatRoomClosed');
      this.socket.on('chatRoomClosed', callback);
    }
  }

  setOnRoomMessagesCallback(callback) {
    if (this.socket) {
      this.socket.off('roomMessages');
      this.socket.on('roomMessages', callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
