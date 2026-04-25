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
  { name: 'Prayer Wall', href: '/prayer', icon: Heart },
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
    if (isSuperAdmin) return 'Super Admin';
    if (profile?.title && profile.title !== 'Member') return profile.title;
    if (isAdmin) return 'Admin';
    if (isCouncil) return 'Council';
    if (profile?.role === 'ministry_leader') return 'Leader';
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
            <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-maroon">
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
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                location.pathname === item.href
                  ? "bg-maroon text-white shadow-lg shadow-maroon/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-maroon"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}

          {(isCouncil || isAdmin || isSuperAdmin) && (
            <Link
              to="/admin/dashboard"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-maroon hover:bg-maroon/5 transition-all duration-300 mt-4 border border-maroon/10"
            >
              <Settings className="h-5 w-5" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-slate-100">
        <Link
          to="/member/profile"
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === '/member/profile' ? "text-maroon bg-maroon/5" : "text-slate-600 hover:bg-slate-50 hover:text-maroon"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Account Settings</span>
        </Link>
      </div>
    </div>
  );
}
