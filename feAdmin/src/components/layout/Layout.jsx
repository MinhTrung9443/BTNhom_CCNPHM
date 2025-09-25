import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Header />
      <Container fluid className="p-0">
        <Row className="g-0">
          <Col md={3} lg={2} className="sidebar-col">
            <Sidebar />
          </Col>
          <Col md={9} lg={10} className="main-content-col">
            <main className="main-content p-4">
              {children}
            </main>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Layout