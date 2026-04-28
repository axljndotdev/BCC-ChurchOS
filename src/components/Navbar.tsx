import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, X, User, LogOut, LayoutDashboard, ShieldCheck, 
  ChevronDown, BookOpen, Users, Info, MessageSquare, 
  Calendar, Video, Image, Mic2, Newspaper, AlertTriangle, Heart
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { getSystemSettings } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, signOut, isCouncil, isAdmin, isSuperAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuGroups = [
    {
      name: 'Our Church',
      items: [
        { name: 'About Us', href: '/about', icon: Info, desc: 'Our mission and history' },
        { name: 'Ministries', href: '/ministries', icon: Users, desc: 'Groups for all ages' },
        { name: 'Gallery', href: '/gallery', icon: Image, desc: 'BCC in pictures' },
      ]
    },
    {
      name: 'Word & Blog',
      items: [
        { name: 'Sermons', href: '/sermons', icon: Mic2, desc: 'Watch recent messages' },
        { name: 'Blogs', href: '/blogs', icon: Newspaper, desc: 'Spiritual growth articles' },
      ]
    },
    {
      name: 'Connect',
      items: [
        { name: 'Upcoming Events', href: '/events', icon: Calendar, desc: 'Join our gatherings' },
        { name: 'Membership', href: '/membership', icon: BookOpen, desc: 'Apply for official membership' },
        { name: 'Prayer Requests', href: '/prayer', icon: Heart, desc: 'How can we pray for you?' },
        { name: 'Contact Us', href: '/contact', icon: MessageSquare, desc: 'Get in touch with us' },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group" onClick={() => setActiveDropdown(null)}>
              <Logo size="md" className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-2xl font-display font-semibold text-slate-900 tracking-tight">BCC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2" ref={dropdownRef}>
            <Link
              to="/"
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                isActive('/') ? "bg-slate-50 text-maroon" : "text-slate-600 hover:text-maroon hover:bg-slate-50"
              )}
            >
              Home
            </Link>

            {menuGroups.map((group) => (
              <div key={group.name} className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === group.name ? null : group.name)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1",
                    activeDropdown === group.name ? "bg-slate-50 text-maroon" : "text-slate-600 hover:text-maroon hover:bg-slate-50"
                  )}
                >
                  {group.name}
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", activeDropdown === group.name && "rotate-180")} />
                </button>

                {activeDropdown === group.name && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-3 grid grid-cols-1 gap-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl transition-all",
                            isActive(item.href) ? "bg-slate-50" : "hover:bg-slate-50"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg bg-slate-50 text-slate-400", isActive(item.href) && "bg-maroon/10 text-maroon")}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={cn("text-sm font-bold", isActive(item.href) ? "text-maroon" : "text-slate-900")}>{item.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/live"
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                isActive('/live') ? "bg-red-50 text-red-600 font-black" : "text-slate-600 hover:text-red-600 hover:bg-red-50"
              )}
            >
              Watch Live
              {isLive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-2" />

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
                {(isCouncil || isAdmin || isSuperAdmin) && (
                  <Link
                    to="/admin/dashboard"
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isActive('/admin/dashboard') ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-blue-600"
                    )}
                    title="Control Panel"
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
                className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-900/10"
              >
                Member's Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isLive && !isOpen && (
              <Link to="/live" className="mr-4 flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
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
        <div className="md:hidden bg-white border-t border-slate-100 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-4 space-y-6">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-2xl text-lg font-bold",
                isActive('/') ? "bg-slate-50 text-maroon" : "text-slate-600"
              )}
            >
              Home
            </Link>

            {menuGroups.map((group) => (
              <div key={group.name} className="space-y-3">
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.name}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all",
                        isActive(item.href) ? "bg-maroon/5 text-maroon" : "text-slate-600 active:bg-slate-50"
                      )}
                    >
                      <item.icon className="h-5 w-5 opacity-60" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Link
              to="/live"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center justify-between px-4 py-4 rounded-2xl font-bold",
                isActive('/live') ? "bg-red-50 text-red-600" : "bg-red-600 text-white shadow-lg shadow-red-600/20"
              )}
            >
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5" />
                Live Broadcast
              </div>
              {isLive && <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>}
            </Link>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
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
                    {(isCouncil || isAdmin || isSuperAdmin) && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin
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
