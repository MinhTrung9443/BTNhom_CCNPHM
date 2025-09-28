import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import socketService from "../../services/socketService";
import { ChatProvider } from "../../contexts/ChatContext";

const Layout = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket when admin is authenticated
      socketService.connect(token);
    } else {
      // Disconnect when not authenticated
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <ChatProvider>
      <div className="admin-layout">
        <Header />
        <Container fluid className="p-0">
          <Row className="g-0">
            <Col md={3} lg={2} className="sidebar-col">
              <Sidebar />
            </Col>
            <Col md={9} lg={10} className="main-content-col">
              <main className="main-content p-4">{children}</main>
            </Col>
          </Row>
        </Container>
      </div>
    </ChatProvider>
  );
};

export default Layout;
