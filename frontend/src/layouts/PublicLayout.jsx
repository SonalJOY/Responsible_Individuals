import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ScrollToHash from '../components/common/ScrollToHash';

export default function PublicLayout() {
  return (
    <div className="public-layout-root">
      <ScrollToHash />
      <Navbar />
      <main className="main-content-area">
        <Outlet />
      </main>
      <Footer />

      <style>{`
        .public-layout-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main-content-area {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
