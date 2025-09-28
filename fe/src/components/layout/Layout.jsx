import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatIcon from "../ChatIcon";
import ChatBox from "../ChatBox";
import "./../../styles/layout.css";
import { useSelector } from "react-redux";

const Layout = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { user, accessToken } = useSelector((state) => state.user);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="layout-wrapper">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
      <ChatIcon onClick={handleChatToggle} />
      <ChatBox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        token={accessToken}
        userId={user ? user._id : null}
      />
    </div>
  );
};

export default Layout;
