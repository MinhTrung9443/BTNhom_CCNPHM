import React, { useEffect } from 'react';
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const ChatWithAI = () => {
  useEffect(() => {
    // Đảm bảo rằng chat chỉ được khởi tạo một lần
    const chatElement = document.querySelector('.n8n-chat-window');
    if (chatElement) {
      return;
    }

    createChat({
      webhookUrl: 'http://localhost:5678/webhook/a89c38bf-e0b7-457a-886a-46af8697e08d/chat',
      enableStreaming: true,
      mode: 'window',
      showWelcomeScreen: false,
      i18n: {
        en: {
          title: 'Xin chào',
          subtitle: "Bắt đầu trò chuyện. Chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.",
          footer: '',
          getStarted: 'Cuộc trò chuyện mới',
          inputPlaceholder: 'Gõ câu hỏi của bạn..',
        },
      },
      initialMessages: [
        'Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn hôm nay?'
      ],
    });

    // Đợi một chút để script n8n có thời gian tạo các phần tử chat
    const styleOverrideTimeout = setTimeout(() => {
      // SỬA LỖI: Sử dụng đúng class selector do bạn cung cấp
      const aiChatButton = document.querySelector('.chat-window-toggle');
      const aiChatWindow = document.querySelector('.n8n-chat-window');

      if (aiChatButton) {
        // Nút chat admin (.chat-icon) cao 60px, cách đáy 20px -> chiếm không gian tới 80px
        // Đặt nút chat AI ở vị trí 90px (cao hơn 10px để tạo khoảng cách)
        aiChatButton.style.setProperty('bottom', '90px', 'important');
      }

      if (aiChatWindow) {
        // Đặt cửa sổ chat AI ngay trên nút bấm của nó
        aiChatWindow.style.setProperty('bottom', '160px', 'important');
      }
    }, 200); // Đợi 200ms

    // Dọn dẹp timeout khi component bị unmount
    return () => clearTimeout(styleOverrideTimeout);

 }, []);

  return null; // Component này không render gì cả, chỉ để chạy script
};

export default ChatWithAI;
