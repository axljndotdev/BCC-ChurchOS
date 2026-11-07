import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  BookOpen, 
  Settings,
  ArrowLeft,
  X,
  Mail,
  Heart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { name: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
  { name: 'Messages', href: '/member/messages', icon: Mail },
  { name: 'Prayer Wall', href: '/member/prayer', icon: Heart },
  { name: 'Events', href: '/member/events', icon: Calendar },
  { name: 'Directory', href: '/member/directory', icon: Users },
  { name: 'Resources', href: '/member/resources', icon: BookOpen },
];

interface MemberSidebarProps {
  onClose?: () => void;
}

export default function MemberSidebar({ onClose }: MemberSidebarProps) {
  const location = useLocation();
  const { profile, isAdmin, isCouncil, isSuperAdmin } = useAuth();

  const getRoleLabel = () => {
    const userRoles = Array.isArray(profile?.role) ? profile.role : (profile?.role ? [profile.role] : []);
    if (isSuperAdmin) return 'Super Admin';
    if (profile?.title && profile.title !== 'Member') return profile.title;
    if (userRoles.includes('church_admin')) return 'Admin';
    if (isCouncil) return 'Council';
    if (userRoles.includes('ministry_leader')) return 'Leader';
    if (userRoles.includes('media')) return 'Media Team';
    return 'Member';
  };

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-slate-500 hover:text-maroon transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Site</span>
          </Link>
          {onClose && (
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 text-slate-400 hover:text-[#7A121D] min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-maroon flex items-center justify-center text-white font-display font-bold overflow-hidden shadow-md">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              profile?.displayName?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-slate-900 truncate w-32">{profile?.displayName}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{getRoleLabel()}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-h-[42px]",
                location.pathname === item.href
                  ? "bg-[#7A121D] text-white shadow-md border border-[#C99738]/50"
                  : "text-stone-600 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
              )}
            >
              <item.icon className="h-5 w-5 text-[#C99738]" />
              <span>{item.name}</span>
            </Link>
          ))}

          {(isCouncil || isAdmin || isSuperAdmin) && (
            <Link
              to="/admin/dashboard"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#7A121D] hover:bg-[#7A121D]/10 transition-all duration-300 mt-4 border border-[#C99738]/40 min-h-[42px]"
            >
              <Settings className="h-5 w-5 text-[#C99738]" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-[#E8D5B5]">
        <Link
          to="/member/profile"
          className={cn(
            "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[42px]",
            location.pathname === '/member/profile' ? "text-[#7A121D] bg-[#FAF6EE] font-bold" : "text-stone-600 hover:bg-[#FAF6EE] hover:text-[#7A121D]"
          )}
        >
          <Settings className="h-5 w-5 text-[#C99738]" />
          <span>Account Settings</span>
        </Link>
      </div>
    </div>
  );
}
