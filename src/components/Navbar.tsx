import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, X, User, LogOut, LayoutDashboard, ShieldCheck, 
  BookOpen, Users, Info, Image, Video, Heart, Home
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { getSystemSettings } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, signOut, isCouncil, isAdmin, isSuperAdmin, isMediaTeam } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLive = async () => {
      const settings = await getSystemSettings();
      if (settings?.isLive) setIsLive(true);
    };
    checkLive();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSignOutConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simplified and stream-lined flat menu as requested
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Ministries', href: '/ministries' },
    { name: 'Photos', href: '/gallery' },
    { name: 'Resources', href: '/resources' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Watch Live', href: '/live', highlight: true },
    { name: 'Give', href: '/give' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <Logo size="md" className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-2xl font-display font-bold text-slate-900 tracking-tight">BCC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const isWatchLive = item.highlight;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                    isWatchLive 
                      ? active 
                        ? "bg-red-50 text-red-600 font-black" 
                        : "text-slate-600 hover:text-red-600 hover:bg-red-50"
                      : active 
                        ? "bg-slate-50 text-maroon" 
                        : "text-slate-600 hover:text-maroon hover:bg-slate-50"
                  )}
                >
                  {item.name}
                  {isWatchLive && isLive && (
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="h-6 w-px bg-slate-200 mx-2" />

            {/* Authenticated Member portal / login button */}
            {user ? (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <Link
                  to="/member/dashboard"
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isActive('/member/dashboard') ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-maroon"
                  )}
                  title="Portal"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                {(isAdmin || isSuperAdmin || isCouncil || isMediaTeam) && (
                  <Link
                    to="/admin/dashboard"
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isActive('/admin/dashboard') ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-blue-600"
                    )}
                    title={isSuperAdmin ? "SuperAdmin Panel" : "Admin Panel"}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowSignOutConfirm(!showSignOutConfirm)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      showSignOutConfirm ? "bg-red-50 text-red-600" : "text-slate-500 hover:text-red-600"
                    )}
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>

                  <AnimatePresence>
                    {showSignOutConfirm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                      >
                        <div className="text-center space-y-3">
                          <p className="text-xs font-bold text-slate-900 leading-tight">Ready to leave?</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setShowSignOutConfirm(false)}
                              className="flex-1 py-1.5 bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              Stay
                            </button>
                            <button 
                              onClick={() => signOut()}
                              className="flex-1 py-1.5 bg-red-600 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                              Leave
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-900/10"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            {isLive && !isOpen && (
              <Link to="/live" className="mr-4 flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-4 space-y-4">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const isWatchLive = item.highlight;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all",
                    isWatchLive 
                      ? active 
                        ? "bg-red-50 text-red-600" 
                        : "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : active 
                        ? "bg-slate-50 text-maroon" 
                        : "text-slate-600 active:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span>{item.name}</span>
                  </div>
                  {isWatchLive && isLive && (
                    <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {user ? (
                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-3 px-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                      {profile?.photoURL && profile.photoURL !== "" ? <img src={profile.photoURL} alt="" className="h-full w-full object-cover" /> : profile?.displayName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{profile?.displayName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {profile?.role && Array.isArray(profile.role) 
                          ? profile.role.map(r => r.replace('_', ' ')).join(' / ') 
                          : profile?.role ? (profile.role as unknown as string).replace('_', ' ') : ''}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/member/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Portal
                    </Link>
                    {(isAdmin || isSuperAdmin || isCouncil || isMediaTeam) && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {isSuperAdmin ? 'SuperAdmin' : 'Admin'}
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full py-4 text-center text-sm font-bold text-red-600 bg-red-50 rounded-2xl"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white text-center font-bold rounded-2xl shadow-lg shadow-slate-900/10"
                >
                  Member's Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
