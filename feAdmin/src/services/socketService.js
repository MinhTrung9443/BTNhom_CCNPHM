import { io } from "socket.io-client";
import { toast } from "react-toastify";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.onNewOrderCallback = null;
    this.onOrderStatusUpdateCallback = null;
    this.onOrderCancelledCallback = null;
    this.onCancellationRequestedCallback = null;
    this.onCancellationApprovedCallback = null;
    this.onReturnRequestedCallback = null;
    this.onReturnApprovedCallback = null;
    this.lastToastTimes = {}; // Track last toast time per event type
    this.listenersRegistered = false; // Track if listeners are already registered
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected, skipping...");
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

      // Auto-join admin room when connected
      this.socket.emit('joinRoom', 'admin');
      console.log("Auto-joined admin room");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.isConnected = false;
    });

    // Only register listeners once
    if (!this.listenersRegistered) {
      this.registerEventListeners();
      this.listenersRegistered = true;
    }
  }

  registerEventListeners() {
    // Listen for new order notifications
    this.socket.on("newOrder", (orderData) => {
      console.log("New order received:", orderData);
      this.handleNewOrderNotification(orderData);
      if (this.onNewOrderCallback) {
        this.onNewOrderCallback(orderData);
      }
    });

    // Listen for order status updates
    this.socket.on("orderStatusUpdate", (data) => {
      console.log("Order status updated:", data);
      this.handleOrderStatusUpdate(data);
      if (this.onOrderStatusUpdateCallback) {
        this.onOrderStatusUpdateCallback(data);
      }
    });

    // Listen for order cancellations
    this.socket.on("orderCancelled", (data) => {
      console.log("Order cancelled:", data);
      this.handleOrderCancelled(data);
      if (this.onOrderCancelledCallback) {
        this.onOrderCancelledCallback(data);
      }
    });

    // Listen for cancellation requests
    this.socket.on("cancellationRequested", (data) => {
      console.log("Cancellation requested:", data);
      this.handleCancellationRequested(data);
      if (this.onCancellationRequestedCallback) {
        this.onCancellationRequestedCallback(data);
      }
    });

    // Listen for cancellation approvals
    this.socket.on("cancellationApproved", (data) => {
      console.log("Cancellation approved:", data);
      this.handleCancellationApproved(data);
      if (this.onCancellationApprovedCallback) {
        this.onCancellationApprovedCallback(data);
      }
    });

    // Listen for return requests
    this.socket.on("returnRequested", (data) => {
      console.log("Return requested:", data);
      this.handleReturnRequested(data);
      if (this.onReturnRequestedCallback) {
        this.onReturnRequestedCallback(data);
      }
    });

    // Listen for return approvals
    this.socket.on("returnApproved", (data) => {
      console.log("Return approved:", data);
      this.handleReturnApproved(data);
      if (this.onReturnApprovedCallback) {
        this.onReturnApprovedCallback(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listenersRegistered = false;
    }
  }

  waitForConnection(timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkConnection = () => {
        if (this.isConnected) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("Socket connection timeout"));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  shouldShowToast(eventKey, orderId) {
    const key = `${eventKey}_${orderId}`;
    const now = Date.now();
    const lastTime = this.lastToastTimes[key] || 0;

    if (now - lastTime < 3000) {
      console.log(`Ignoring duplicate ${eventKey} notification for order ${orderId}`);
      return false;
    }

    this.lastToastTimes[key] = now;
    return true;
  }

  handleNewOrderNotification(orderData) {
    if (!this.shouldShowToast('newOrder', orderData.orderId)) {
      return;
    }

    const message = `Đơn hàng mới: #${orderData.orderId.slice(-8)} - ${orderData.orderLines
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

  handleOrderStatusUpdate(data) {
    if (!this.shouldShowToast('orderStatusUpdate', data.orderId)) {
      return;
    }

    const message = `Đơn hàng #${data.orderId.slice(-8)} đã được cập nhật: ${data.message}`;
    toast.info(message, {
      position: "bottom-right",
      autoClose: 8000,
      onClick: () => {
        window.location.href = `/orders/${data.orderId}`;
      },
    });
  }

  handleOrderCancelled(data) {
    if (!this.shouldShowToast('orderCancelled', data.orderId)) {
      return;
    }

    const message = `Đơn hàng #${data.orderId.slice(-8)} đã bị hủy${data.reason ? `: ${data.reason}` : ""}`;
    toast.warning(message, {
      position: "bottom-right",
      autoClose: 8000,
      onClick: () => {
        window.location.href = `/orders/${data.orderId}`;
      },
    });
  }

  handleCancellationRequested(data) {
    if (!this.shouldShowToast('cancellationRequested', data.orderId)) {
      return;
    }

    const message = `Yêu cầu hủy đơn hàng #${data.orderId.slice(-8)}${data.reason ? `: ${data.reason}` : ""}`;
    toast.info(message, {
      position: "bottom-right",
      autoClose: 10000,
      onClick: () => {
        window.location.href = `/orders/${data.orderId}`;
      },
    });
  }

  handleCancellationApproved(data) {
    if (!this.shouldShowToast('cancellationApproved', data.orderId)) {
      return;
    }

    const message = data.message || `Yêu cầu hủy đơn #${data.orderId.slice(-8)} đã được chấp thuận`;
    toast.success(message, {
      position: "bottom-right",
      autoClose: 8000,
      onClick: () => {
        window.location.href = `/orders/${data.orderId}`;
      },
    });
  }

  handleReturnRequested(data) {
    if (!this.shouldShowToast('returnRequested', data.orderId)) {
      return;
    }

    const message = `Yêu cầu trả hàng cho đơn #${data.orderId.slice(-8)} - ${new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(data.orderAmount)}`;
    toast.info(message, {
      position: "bottom-right",
      autoClose: 10000,
      onClick: () => {
        window.location.href = `/orders/${data.orderId}`;
      },
    });
  }

  handleReturnApproved(data) {
    if (!this.shouldShowToast('returnApproved', data.orderId)) {
      return;
    }

    const message = data.message || `Yêu cầu trả hàng cho đơn #${data.orderId.slice(-8)} đã được chấp thuận`;
    toast.success(message, {
      position: "bottom-right",
      autoClose: 8000,
      onClick: () => {
        window.location.href = `/orders/${data.orderId}`;
      },
    });
  }

  setOnNewOrderCallback(callback) {
    this.onNewOrderCallback = callback;
  }

  setOnOrderStatusUpdateCallback(callback) {
    this.onOrderStatusUpdateCallback = callback;
  }

  setOnOrderCancelledCallback(callback) {
    this.onOrderCancelledCallback = callback;
  }

  setOnCancellationRequestedCallback(callback) {
    this.onCancellationRequestedCallback = callback;
  }

  setOnCancellationApprovedCallback(callback) {
    this.onCancellationApprovedCallback = callback;
  }

  setOnReturnRequestedCallback(callback) {
    this.onReturnRequestedCallback = callback;
  }

  setOnReturnApprovedCallback(callback) {
    this.onReturnApprovedCallback = callback;
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  getActiveRooms() {
    if (this.socket && this.isConnected) {
      console.log("[SocketService] Requesting active rooms...");
      this.emit("getActiveRooms");
      return true;
    } else {
      console.warn("[SocketService] Cannot get active rooms - socket not connected");
      return false;
    }
  }

  // Chat methods
  joinRoom(room) {
    if (this.socket && this.isConnected) {
      console.log(`[SocketService] Joining room: ${room}`);
      this.emit("joinRoom", room);
    } else {
      console.warn(`[SocketService] Cannot join room ${room} - socket not connected`);
    }
  }

  leaveRoom(room) {
    this.emit("leaveRoom", room);
  }

  sendMessage(room, message) {
    this.emit("sendMessage", { room, message });
  }

  setOnMessageCallback(callback) {
    if (this.socket) {
      this.socket.off("message");
      if (callback) {
        this.socket.on("message", callback);
      }
    }
  }

  setOnActiveRoomsCallback(callback) {
    if (this.socket) {
      this.socket.off("activeChatRooms");
      if (callback) {
        this.socket.on("activeChatRooms", callback);
      }
    }
  }

  setOnNewRoomCallback(callback) {
    if (this.socket) {
      this.socket.off("newChatRoom");
      if (callback) {
        this.socket.on("newChatRoom", callback);
      }
    }
  }

  setOnRoomClosedCallback(callback) {
    if (this.socket) {
      this.socket.off("chatRoomClosed");
      if (callback) {
        this.socket.on("chatRoomClosed", callback);
      }
    }
  }

  setOnRoomMessagesCallback(callback) {
    if (this.socket) {
      this.socket.off("roomMessages");
      if (callback) {
        this.socket.on("roomMessages", callback);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;
