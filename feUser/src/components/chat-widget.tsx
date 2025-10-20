"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
// Import the hook and the message type
import { useSocket, IChatMessage } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, MessageCircle, Minimize2, Headphones, HelpCircle } from "lucide-react";
import "@/styles/chat-widget.css";

// The IChatMessage interface is now imported from the hook, so this is not needed.
// interface Message {
//   sender: string;
//   senderRole: "user" | "admin";
//   message: string;
//   room: string;
//   timestamp: string;
// }

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // The useSocket hook now provides everything needed for the chat functionality.
  const { isConnected, messages, sendMessage: sendSocketMessage } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the bottom of the chat whenever new messages arrive.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // This effect handles showing a notification when a new message arrives
  // and the chat window is either closed or minimized.
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if ((!isOpen || isMinimized) && lastMessage.senderRole === "admin") {
        setHasNewMessage(true);

        // Show a browser notification if permission is granted.
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("Tin nhắn mới từ hỗ trợ viên", {
            body: lastMessage.message.length > 50 ? lastMessage.message.substring(0, 50) + "..." : lastMessage.message,
            icon: "/favicon.ico", // Make sure this icon exists in your public folder
            tag: "chat-message",
          });
        }
      }
    }
  }, [messages, isOpen, isMinimized]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);

    // Request notification permission when the user opens the chat for the first time.
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(true);
    setHasNewMessage(false);
  };

  // This function is called when the user sends a message.
  const sendMessage = () => {
    // Basic validation: don't send empty messages.
    if (!inputMessage.trim()) return;

    // Use the sendMessage function provided by the useSocket hook.
    sendSocketMessage(inputMessage.trim());
    // Clear the input field after sending.
    setInputMessage("");
  };

  // Handle the "Enter" key press to send a message.
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents adding a new line
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Don't render the widget if the user is not logged in.
  if (!session) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-20 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={handleOpenChat}
            size="lg"
            className={`rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg relative transition-all duration-200 ${
              hasNewMessage ? "chat-button-pulse" : ""
            }`}
            suppressHydrationWarning
          >
            <div className="relative">
              <Headphones className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            {hasNewMessage && <div className="new-message-indicator"></div>}
          </Button>
        )}
      </div>

      {/* Minimized Chat Window */}
      {isOpen && isMinimized && (
        <Card className="fixed bottom-20 right-6 w-80 h-12 z-50 shadow-2xl cursor-pointer" onClick={handleOpenChat}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-4">
            <CardTitle className="text-sm font-medium">
              Hỗ trợ khách hàng
              {hasNewMessage && <span className="ml-2 text-xs text-red-600">● Tin nhắn mới</span>}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseChat();
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Full Chat Window */}
      {isOpen && !isMinimized && (
        <Card className="fixed bottom-20 right-6 w-80 h-96 z-50 shadow-2xl chat-widget-enter-active">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Hỗ trợ khách hàng
              {isConnected && <span className="ml-2 text-xs text-green-600">● Đang kết nối</span>}
              {!isConnected && <span className="ml-2 text-xs text-red-600">● Mất kết nối</span>}
            </CardTitle>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={handleMinimizeChat} className="h-6 w-6 p-0">
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCloseChat} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full p-3">
            {/* Messages Area */}
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <div className="mb-2">👋</div>
                    <div>Xin chào! Tôi có thể giúp gì cho bạn?</div>
                    <div className="text-xs mt-2 text-gray-400">Nhập tin nhắn để bắt đầu cuộc trò chuyện</div>
                  </div>
                )}
                {messages.map((msg: IChatMessage, index) => (
                  <div key={index} className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-end space-x-2 max-w-[75%]`}>
                      {msg.senderRole === "admin" && (
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">CS</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={msg.senderRole === "user" ? "order-2" : ""}>
                        <div
                          className={`px-3 py-2 rounded-lg text-sm break-words ${
                            msg.senderRole === "user" ? "bg-green-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none border"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div className={`text-xs text-gray-400 mt-1 px-1 ${msg.senderRole === "user" ? "text-right" : "text-left"}`}>
                          {msg.senderRole === "admin" ? "Hỗ trợ viên" : "Bạn"} • {formatTime(msg.timestamp)}
                        </div>
                      </div>
                      {msg.senderRole === "user" && (
                        <Avatar className="h-7 w-7 flex-shrink-0 order-1">
                          <AvatarImage
                            src={
                              session?.user?.avatar
                                ? session.user.avatar.startsWith("http")
                                  ? session.user.avatar
                                  : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${session.user.avatar}`
                                : ""
                            }
                          />
                          <AvatarFallback className="bg-green-600 text-white text-xs font-medium">
                            {session?.user?.name?.charAt(0).toUpperCase() || "B"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex space-x-2 pt-3 border-t bg-gray-50/50">
              <div className="flex-1 relative">
                <Input
                  placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  className="text-sm pr-10 border-gray-200 focus:border-green-500 bg-white"
                  suppressHydrationWarning
                />
                {!isConnected && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || !isConnected}
                size="sm"
                className="px-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                suppressHydrationWarning
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}