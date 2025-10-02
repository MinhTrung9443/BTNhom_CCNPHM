import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(token: string) {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected, skipping...");
      return this.socket;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

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

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  sendMessage(room: string, message: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("sendMessage", { room, message });
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

// Singleton instance
const socketService = new SocketService();

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.accessToken) return;

    // Sử dụng SocketService để tạo kết nối
    const socket = socketService.connect(session.user.accessToken);
    socketRef.current = socket;

    return () => {
      // Không disconnect ở đây vì có thể có nhiều components sử dụng socket
      // socketService.disconnect();
    };
  }, [session?.user?.accessToken]);

  return {
    socket: socketRef.current,
    socketService,
    isConnected: socketService.isSocketConnected(),
  };
};
