import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import MemberSidebar from '../components/MemberSidebar';
import { Menu, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import Breadcrumbs from '../components/Breadcrumbs';

export default function MemberLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/member/dashboard';

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
        fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none border-r border-[#C99738]/20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <MemberSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#C99738]/20 h-16 flex items-center justify-between px-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-stone-600 hover:text-[#7A121D] transition-colors rounded-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-xl font-serif font-bold text-[#5C0612]">BCC</span>
            </Link>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-stone-600 hover:text-[#7A121D] transition-colors rounded-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#E8D5B5]/60 bg-[#FAF6EE]"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-10 safe-area-bottom">
          <div className="max-w-6xl mx-auto">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <Breadcrumbs />
              {!isDashboard && (
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-[#7A121D] transition-colors uppercase tracking-widest min-h-[36px]"
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
