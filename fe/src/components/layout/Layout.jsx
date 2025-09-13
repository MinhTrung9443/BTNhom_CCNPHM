import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './../../styles/layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;