import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Menu, X, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/admin/dashboard';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-slate-500 hover:text-maroon transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-xl font-display font-bold text-slate-900">Admin</span>
            </Link>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-maroon transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <Breadcrumbs />
              {!isDashboard && (
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-maroon transition-colors uppercase tracking-widest"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
              )}
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
