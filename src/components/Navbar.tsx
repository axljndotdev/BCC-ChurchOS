import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, X, User, LogOut, LayoutDashboard, ShieldCheck, 
  Heart, Home, Radio, Flame, Sparkles, ChevronDown,
  Video, Calendar, BookOpen, MessageSquare, Image, FileText, 
  Newspaper, MapPin, Phone, Info, MessageCircle, Compass
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { getSystemSettings } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, signOut, isCouncil, isAdmin, isSuperAdmin, isMediaTeam } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLive = async () => {
      try {
        const settings = await getSystemSettings();
        if (settings?.isLive) setIsLive(true);
      } catch (err) {
        console.error('Failed to check live status', err);
      }
    };
    checkLive();
  }, []);

  // Lock body scroll cleanly when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowMoreDropdown(false);
        setShowSignOutConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowSignOutConfirm(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer and dropdowns upon route change
  useEffect(() => {
    setIsOpen(false);
    setShowMoreDropdown(false);
    setShowSignOutConfirm(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Desktop primary navigation items
  const desktopPrimaryNav = [
    { name: 'Home', href: '/' },
    { name: 'New Here?', href: '/new-here', isNewHere: true },
    { name: 'About', href: '/about' },
    { name: 'Sermons', href: '/sermons' },
    { name: 'Events', href: '/events' },
    { name: 'Ministries', href: '/ministries' },
    { name: 'Project AC', href: '/project-ac', isCampaign: true },
  ];

  // Secondary items shown in desktop "More" dropdown
  const desktopMoreItems = [
    { name: 'New Here / Plan Visit', href: '/new-here', icon: Compass, description: 'Service flow, dress code & FAQs' },
    { name: 'Church Comments', href: '/comments', icon: MessageCircle, description: 'Leave feedback, encouragement & comments' },
    { name: 'Prayer Wall', href: '/prayer', icon: MessageSquare, description: 'Post requests & pray together' },
    { name: 'Photo Gallery', href: '/gallery', icon: Image, description: 'Moments of worship & fellowship' },
    { name: 'Resources & Bulletins', href: '/resources', icon: FileText, description: 'Download guides and materials' },
    { name: 'Church News & Blogs', href: '/blogs', icon: Newspaper, description: 'Articles and pastoral insights' },
    { name: 'Contact & Location', href: '/contact', icon: MapPin, description: 'Find us in Kabankalan City' },
  ];

  const isMoreActive = desktopMoreItems.some(item => isActive(item.href));

  return (
    <>
      <header className="sticky top-0 z-40">
        {/* Main Navigation Bar with elegant translucent backdrop */}
        <nav className="bg-[#FAF7F2]/70 backdrop-blur-md border-b border-[#E8D5B5]/35 shadow-xs/60 relative z-30 transition-all">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              
              {/* Logo Brand */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-h-[44px] py-1">
                  <Logo size="md" className="h-9 w-9 sm:h-11 sm:w-11 group-hover:scale-105 transition-transform duration-300" />
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-display font-bold text-[#5C0612] tracking-tight leading-none">
                      BCC
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#9A6F1D] font-semibold mt-0.5">
                      Bethesda Community Church
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1 xl:space-x-2" ref={dropdownRef}>
                {desktopPrimaryNav.map((item) => {
                  const active = isActive(item.href);
                  
                  if (item.isNewHere) {
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 min-h-[38px] shrink-0",
                          active
                            ? "text-[#7A121D] font-bold bg-[#FAF6EE] border-b-2 border-[#C99738]"
                            : "text-[#7A121D] bg-[#FAF6EE]/80 hover:bg-[#FAF6EE] border border-[#E8D5B5]/60 hover:border-[#C99738]"
                        )}
                      >
                        <Compass className="h-3.5 w-3.5 text-[#9A6F1D]" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  }

                  if (item.isCampaign) {
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 min-h-[38px] shrink-0",
                          active
                            ? "text-[#7A121D] font-bold bg-[#FAF6EE] border-b-2 border-[#C99738]"
                            : "text-[#9A6F1D] hover:text-[#7A121D] hover:bg-[#FAF6EE]"
                        )}
                      >
                        <Sparkles className="h-3 w-3 text-[#C99738]" />
                        {item.name}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 min-h-[38px] shrink-0",
                        active 
                          ? "text-[#7A121D] font-bold bg-[#FAF6EE] border-b-2 border-[#C99738]" 
                          : "text-stone-700 hover:text-[#7A121D] hover:bg-[#FAF6EE]"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                {/* More Dropdown for Desktop */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                    className={cn(
                      "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 min-h-[38px] shrink-0",
                      isMoreActive || showMoreDropdown
                        ? "text-[#7A121D] font-bold bg-[#FAF6EE]"
                        : "text-stone-700 hover:text-[#7A121D] hover:bg-[#FAF6EE]"
                    )}
                    aria-expanded={showMoreDropdown}
                  >
                    <span>More</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showMoreDropdown && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {showMoreDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-72 bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#E8D5B5] p-2 z-50 overflow-hidden"
                      >
                        <div className="space-y-1">
                          {desktopMoreItems.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setShowMoreDropdown(false)}
                                className={cn(
                                  "flex items-start gap-3 p-2.5 rounded-xl transition-colors",
                                  active 
                                    ? "bg-[#FAF6EE] text-[#7A121D]" 
                                    : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                                )}
                              >
                                <div className={cn(
                                  "p-2 rounded-lg shrink-0 mt-0.5",
                                  active ? "bg-[#7A121D] text-white" : "bg-stone-100 text-[#C99738]"
                                )}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold leading-tight">{item.name}</p>
                                  <p className="text-[10px] text-stone-500 font-normal leading-snug mt-0.5">{item.description}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Watch Live */}
                <Link
                  to="/live"
                  className={cn(
                    "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 min-h-[38px] shrink-0",
                    isActive('/live')
                      ? "text-[#7A121D] font-bold bg-[#FBF4E6]"
                      : "text-stone-700 hover:text-[#7A121D] hover:bg-[#FAF6EE]"
                  )}
                >
                  <Radio className="h-3.5 w-3.5 text-[#C99738]" />
                  <span>Live</span>
                  <span className="flex h-1.5 w-1.5 relative">
                    {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                    <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", isLive ? "bg-red-600" : "bg-[#C99738]")}></span>
                  </span>
                </Link>

                {/* Give Button */}
                <Link
                  to="/give"
                  className={cn(
                    "ml-1 xl:ml-2 px-3.5 xl:px-4 py-1.5 xl:py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs border min-h-[38px] flex items-center shrink-0 gap-1.5",
                    isActive('/give')
                      ? "bg-[#5C0612] text-white border-[#E5B869]" 
                      : "bg-[#7A121D] text-white border-[#C99738]/70 hover:bg-[#5C0612] hover:border-[#E5B869]"
                  )}
                >
                  <Heart className="h-3.5 w-3.5 text-[#E5B869] fill-current" />
                  <span>Give</span>
                </Link>

                <div className="h-6 w-px bg-[#E8D5B5]/60 mx-1 xl:mx-2" />

                {/* Authenticated Member portal / login button */}
                {user ? (
                  <div className="flex items-center gap-1.5 p-1 bg-[#FAF6EE] rounded-xl border border-[#E8D5B5]/50">
                    <Link
                      to="/member/dashboard"
                      className={cn(
                        "p-2 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center",
                        isActive('/member/dashboard') ? "bg-white text-[#7A121D] shadow-xs" : "text-stone-600 hover:text-[#7A121D]"
                      )}
                      title="Portal"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                    {(isAdmin || isSuperAdmin || isCouncil || isMediaTeam) && (
                      <Link
                        to="/admin/dashboard"
                        className={cn(
                          "p-2 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center",
                          isActive('/admin/dashboard') ? "bg-white text-[#C99738] shadow-xs" : "text-stone-600 hover:text-[#C99738]"
                        )}
                        title={isSuperAdmin ? "SuperAdmin Panel" : "Admin Panel"}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Link>
                    )}
                    <div className="relative">
                      <button
                        onClick={() => setShowSignOutConfirm(!showSignOutConfirm)}
                        className={cn(
                          "p-2 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center",
                          showSignOutConfirm ? "bg-red-50 text-red-600" : "text-stone-600 hover:text-red-600"
                        )}
                        title="Sign Out"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>

                      <AnimatePresence>
                        {showSignOutConfirm && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-48 p-4 bg-[#FDFBF7] rounded-xl shadow-2xl border border-[#E8D5B5] z-50 overflow-hidden"
                          >
                            <div className="text-center space-y-3">
                              <p className="text-xs font-bold text-stone-900 leading-tight">Ready to sign out?</p>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setShowSignOutConfirm(false)}
                                  className="flex-1 py-2 bg-[#FAF6EE] text-stone-600 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-stone-200 transition-colors min-h-[36px]"
                                >
                                  Stay
                                </button>
                                <button 
                                  onClick={() => signOut()}
                                  className="flex-1 py-2 bg-[#7A121D] text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-[#5C0612] transition-colors shadow-xs min-h-[36px]"
                                >
                                  Sign Out
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
                    className="px-4 py-2 border border-[#C99738]/60 text-[#7A121D] hover:bg-[#7A121D] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 min-h-[40px] flex items-center"
                  >
                    Member Login
                  </Link>
                )}
              </div>

              {/* Mobile Header Actions (Give CTA + Hamburger Toggle) */}
              <div className="lg:hidden flex items-center gap-2">
                <Link 
                  to="/give" 
                  className="px-3 py-1.5 rounded-full bg-[#7A121D] text-white text-[11px] font-bold uppercase tracking-wider border border-[#C99738]/70 shadow-xs flex items-center gap-1.5 min-h-[38px]"
                >
                  <Heart className="h-3 w-3 fill-current text-[#E5B869]" />
                  <span>Give</span>
                </Link>

                {isLive && (
                  <Link 
                    to="/live" 
                    className="p-2 rounded-xl bg-red-50 text-red-600 flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center"
                    aria-label="Service Live Stream"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                  </Link>
                )}

                {/* Hamburger Button with >= 44px touch target */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-stone-800 hover:text-[#7A121D] hover:bg-[#FAF6EE] active:scale-95 transition-all border border-[#E8D5B5]/60 bg-white/80 shadow-xs"
                  aria-label="Toggle navigation menu"
                  aria-expanded={isOpen}
                >
                  {isOpen ? <X className="h-6 w-6 text-[#7A121D]" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* 
        Mobile Slide-over Drawer Portal
        Mounting directly into document.body ensures it is NOT confined or clipped 
        by any header sticky, backdrop-filter, or transform styles.
      */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="lg:hidden fixed inset-0 z-[1000] overflow-hidden" role="dialog" aria-modal="true">
              {/* Dimmed backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs"
              />

              {/* Drawer Container (Smooth Slide-In from Right) */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 right-0 w-full max-w-[340px] xs:max-w-[380px] bg-[#FDFBF7] shadow-2xl flex flex-col h-[100dvh] overflow-hidden border-l border-[#E8D5B5]"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-[#E8D5B5]/70 bg-[#FAF6EE] shrink-0">
                  <Link 
                    to="/" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center space-x-2.5"
                  >
                    <Logo size="sm" className="h-7 w-7" />
                    <div className="flex flex-col">
                      <span className="text-base font-display font-bold text-[#5C0612] leading-tight">
                        Bethesda Church
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#9A6F1D] font-semibold">
                        Kabankalan City
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-600 hover:text-[#7A121D] hover:bg-stone-200/60 active:scale-95 transition-all"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6">
                  
                  {/* Top Highlight Action Cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/live"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider",
                        isActive('/live')
                          ? "bg-[#7A121D] text-white border-[#C99738]"
                          : "bg-white text-[#7A121D] border-[#E8D5B5] hover:bg-[#FAF6EE]"
                      )}
                    >
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isLive ? "bg-red-500" : "bg-[#C99738]")}></span>
                      </span>
                      <span className="truncate">Watch Live</span>
                    </Link>

                    <Link
                      to="/project-ac"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider",
                        isActive('/project-ac')
                          ? "bg-[#7A121D] text-white border-[#C99738]"
                          : "bg-[#FAF6EE] text-[#9A6F1D] border-[#C99738]/40 hover:bg-[#F5EDDC]"
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#C99738] shrink-0" />
                      <span className="truncate">Project AC</span>
                    </Link>

                    <Link
                      to="/give"
                      onClick={() => setIsOpen(false)}
                      className="col-span-2 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#7A121D] text-white text-xs font-bold uppercase tracking-widest border border-[#C99738] shadow-xs active:scale-[0.99] transition-transform"
                    >
                      <Heart className="h-4 w-4 text-[#E5B869] fill-current" />
                      <span>Give & Tithes</span>
                    </Link>
                  </div>

                  {/* Section 1: Church Life & Worship */}
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-[#9A6F1D] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                      <span>✦</span> Church Life & Worship
                    </p>
                    
                    <Link
                      to="/"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/') && location.pathname === '/'
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <Home className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Home</span>
                    </Link>

                    <Link
                      to="/new-here"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/new-here')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-[#7A121D] bg-[#FAF6EE]/50 hover:bg-[#FAF6EE] font-semibold"
                      )}
                    >
                      <Compass className="h-4 w-4 text-[#9A6F1D] shrink-0" />
                      <div className="flex items-center gap-2">
                        <span>New Here? Plan a Visit</span>
                        <span className="px-1.5 py-0.2 bg-[#7A121D] text-white text-[9px] font-bold uppercase rounded tracking-wider">Sundays @ 8:45 AM</span>
                      </div>
                    </Link>

                    <Link
                      to="/about"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/about')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <Info className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>About Us & Vision</span>
                    </Link>

                    <Link
                      to="/sermons"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/sermons')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <Video className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Sermons & Messages</span>
                    </Link>

                    <Link
                      to="/events"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/events')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <Calendar className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Upcoming Events</span>
                    </Link>

                    <Link
                      to="/ministries"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/ministries')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <BookOpen className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Ministries & Groups</span>
                    </Link>

                    <Link
                      to="/prayer"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/prayer')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Prayer Wall & Requests</span>
                    </Link>
                  </div>

                  {/* Section 2: Media, Community & Resources */}
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-[#9A6F1D] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                      <span>✦</span> Community & Media
                    </p>

                    <Link
                      to="/comments"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/comments')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <MessageCircle className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Church Comments</span>
                    </Link>

                    <Link
                      to="/gallery"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/gallery')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <Image className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Photo Gallery</span>
                    </Link>

                    <Link
                      to="/resources"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/resources')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <FileText className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Resources & Bulletins</span>
                    </Link>

                    <Link
                      to="/blogs"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/blogs')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <Newspaper className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>News & Articles</span>
                    </Link>

                    <Link
                      to="/contact"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[46px]",
                        isActive('/contact')
                          ? "bg-[#FAF6EE] text-[#7A121D] font-bold border-l-4 border-[#C99738]"
                          : "text-stone-700 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
                      )}
                    >
                      <MapPin className="h-4 w-4 text-[#C99738] shrink-0" />
                      <span>Contact & Location</span>
                    </Link>
                  </div>

                  {/* Section 3: Member Area & Accounts */}
                  <div className="pt-4 border-t border-[#E8D5B5]/70">
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#E8D5B5]/60 shadow-xs">
                          <div className="h-10 w-10 rounded-full bg-[#FAF6EE] border border-[#C99738]/50 flex items-center justify-center font-bold text-[#7A121D] overflow-hidden shrink-0">
                            {profile?.photoURL ? (
                              <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                            ) : (
                              profile?.displayName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-stone-900 truncate">
                              {profile?.displayName || 'Church Member'}
                            </p>
                            <p className="text-[10px] text-[#C99738] font-bold uppercase tracking-wider truncate">
                              {profile?.role && Array.isArray(profile.role) 
                                ? profile.role.map(r => r.replace('_', ' ')).join(' / ') 
                                : profile?.role ? String(profile.role).replace('_', ' ') : 'Member'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to="/member/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl text-xs font-bold text-stone-700 hover:text-[#7A121D] border border-[#E8D5B5] min-h-[44px] shadow-xs active:scale-[0.98] transition-all"
                          >
                            <LayoutDashboard className="h-4 w-4 text-[#C99738]" />
                            <span>Portal</span>
                          </Link>

                          {(isAdmin || isSuperAdmin || isCouncil || isMediaTeam) && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl text-xs font-bold text-[#7A121D] border border-[#E8D5B5] min-h-[44px] shadow-xs active:scale-[0.98] transition-all"
                            >
                              <ShieldCheck className="h-4 w-4 text-[#C99738]" />
                              <span>{isSuperAdmin ? 'SuperAdmin' : 'Admin'}</span>
                            </Link>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                          className="w-full py-3 text-center text-xs uppercase tracking-widest font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl min-h-[44px] transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3.5 bg-[#7A121D] text-white text-center font-bold rounded-xl shadow-xs border border-[#C99738]/60 flex items-center justify-center gap-2 min-h-[48px] text-xs uppercase tracking-wider"
                      >
                        <User className="h-4 w-4 text-[#E5B869]" />
                        <span>Member Portal Login</span>
                      </Link>
                    )}
                  </div>

                  {/* Drawer Footer with Service Schedule & Contact */}
                  <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8D5B5]/60 text-xs text-stone-600 space-y-2">
                    <p className="font-bold text-[#5C0612] text-[11px] uppercase tracking-wider">
                      Service Schedule
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      <strong>Sunday Worship:</strong> 8:45 AM (Countdown 8:40 AM)<br />
                      <strong>Midweek Prayer:</strong> Wed 6:00 PM
                    </p>
                    <div className="pt-2 border-t border-[#E8D5B5]/60 flex items-center justify-between text-[11px] text-stone-500">
                      <span>Kabankalan City</span>
                      <Link to="/contact" onClick={() => setIsOpen(false)} className="text-[#7A121D] font-bold hover:underline">
                        Get Directions →
                      </Link>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 
        Mobile Bottom Quick Action Bar
        Placed outside the header so it remains strictly anchored to the viewport
        and uses safe-area-bottom for edge-to-edge mobile devices (iPhone home indicator).
      */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#E8D5B5] px-2 py-1 shadow-lg flex items-center justify-around safe-area-bottom"
      >
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[10px] font-semibold transition-colors",
            isActive('/') && location.pathname === '/' ? "text-[#7A121D] font-bold" : "text-stone-500 hover:text-[#7A121D]"
          )}
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          to="/sermons"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[10px] font-semibold transition-colors",
            isActive('/sermons') ? "text-[#7A121D] font-bold" : "text-stone-500 hover:text-[#7A121D]"
          )}
        >
          <Video className="h-5 w-5 mb-0.5 text-[#C99738]" />
          <span>Sermons</span>
        </Link>

        <Link
          to="/project-ac"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[10px] font-semibold transition-colors",
            isActive('/project-ac') ? "text-[#7A121D] font-bold" : "text-stone-500 hover:text-[#7A121D]"
          )}
        >
          <Flame className="h-5 w-5 mb-0.5 text-[#C99738]" />
          <span>Project AC</span>
        </Link>

        <Link
          to="/give"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[10px] font-semibold transition-colors",
            isActive('/give') ? "text-[#7A121D] font-bold" : "text-stone-500 hover:text-[#7A121D]"
          )}
        >
          <Heart className="h-5 w-5 mb-0.5 text-[#7A121D]" />
          <span>Give</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-[10px] font-semibold transition-colors",
            isOpen ? "text-[#7A121D] font-bold" : "text-stone-500 hover:text-[#7A121D]"
          )}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5 mb-0.5 text-[#7A121D]" /> : <Menu className="h-5 w-5 mb-0.5" />}
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
}
