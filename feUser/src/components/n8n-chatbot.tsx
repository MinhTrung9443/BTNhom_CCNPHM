"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import "@n8n/chat/style.css";
import "@/styles/n8n-chatbot.css";

/**
 * N8nChatbot component
 * Tích hợp chatbot n8n với accessToken động từ session
 * 
 * Component này sẽ khởi tạo chat widget khi:
 * - User đã đăng nhập (có session)
 * - AccessToken có sẵn
 * - Webhook URL được cấu hình trong env
 */
export default function N8nChatbot() {
  const { data: session, status } = useSession();
  const chatInitialized = useRef(false);

  useEffect(() => {
    // Chỉ khởi tạo chat khi:
    // 1. Session đã load xong (không phải "loading")
    // 2. User đã đăng nhập (có accessToken)
    // 3. Chưa khởi tạo chat trước đó
    if (
      status !== "loading" &&
      session?.user?.accessToken &&
      !chatInitialized.current
    ) {
      // Kiểm tra xem @n8n/chat đã được load chưa
      import("@n8n/chat").then(({ createChat }) => {
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

        if (!webhookUrl) {
          console.error(
            "⚠️ N8N Webhook URL chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_N8N_WEBHOOK_URL vào file .env"
          );
          return;
        }

        try {
          createChat({
            webhookUrl,
            enableStreaming: true,
            metadata: {
              accessToken: session.user.accessToken,
            },
            mode: "window",
            showWelcomeScreen: false,
            i18n: {
              en: {
                title: "Xin chào",
                subtitle:
                  "Bắt đầu trò chuyện. Chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.",
                footer: "",
                getStarted: "Cuộc trò chuyện mới",
                inputPlaceholder: "Gõ câu hỏi của bạn..",
                closeButtonTooltip: "Đóng",
              },
            },
            initialMessages: ["Tôi có thể giúp gì cho bạn?"],
          });

          chatInitialized.current = true;
          console.log("✅ N8N Chatbot đã được khởi tạo thành công");

          // Điều chỉnh vị trí sau khi load xong
          setTimeout(() => {
            const adjustN8nPosition = () => {
              const n8nElements = document.querySelectorAll(
                'div[style*="position"][style*="fixed"]'
              );
              n8nElements.forEach((el: Element) => {
                const htmlEl = el as HTMLElement;
                // Chỉ điều chỉnh nếu không phải ChatWidget
                if (!htmlEl.className.includes("chat-widget") && 
                    htmlEl.querySelector("iframe")) {
                  htmlEl.style.bottom = "24px";
                  htmlEl.style.right = "40px";
                  htmlEl.style.zIndex = "9998";
                }
              });
            };

            adjustN8nPosition();
            // Chạy lại sau 1s để đảm bảo
            setTimeout(adjustN8nPosition, 1000);
          }, 500);
        } catch (error) {
          console.error("❌ Lỗi khi khởi tạo N8N Chatbot:", error);
        }
      });
    }
  }, [session, status]);

  // Component này không render gì cả vì @n8n/chat tự tạo widget
  return null;
}
