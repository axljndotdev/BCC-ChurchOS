import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isHeroPage = isHome || ['/about', '/events', '/ministries', '/blogs', '/contact', '/sermons', '/new-here', '/visit'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      <main className="flex-grow pb-20 sm:pb-24 lg:pb-0">
        {!isHeroPage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
            <Breadcrumbs />
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
