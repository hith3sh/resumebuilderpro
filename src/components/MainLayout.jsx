import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isLoginPage && !isAdminPage && <Header />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isLoginPage && !isAdminPage && <Footer />}
    </div>
  );
};

export default MainLayout;