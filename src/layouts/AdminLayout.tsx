import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { Menu, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { isSuperAdmin } = useAuth();
  const isDashboard = location.pathname === '/admin/dashboard';

  // Automatically close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#FDFBF7] border-b border-[#E8D5B5] h-16 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            {!isDashboard && (
              <button 
                onClick={() => navigate(-1)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-[#7A121D] transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-xl font-display font-bold text-[#5C0612]">{isSuperAdmin ? 'SuperAdmin' : 'Admin'}</span>
            </Link>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-700 hover:text-[#7A121D] transition-colors rounded-xl border border-[#E8D5B5] bg-white p-2"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 safe-area-bottom">
          <div className="max-w-6xl mx-auto">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <Breadcrumbs />
              {!isDashboard && (
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-maroon transition-colors uppercase tracking-widest min-h-[36px]"
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
