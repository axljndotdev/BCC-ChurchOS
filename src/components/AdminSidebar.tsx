import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Megaphone, 
  Image, 
  Users,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Settings,
  FileText,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const adminGroups = [
  {
    name: 'General',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    name: 'Content',
    items: [
      { name: 'Sermons', href: '/admin/sermons', icon: Video },
      { name: 'Blogs', href: '/admin/blogs', icon: FileText },
      { name: 'Media/Gallery', href: '/admin/media', icon: Image },
    ]
  },
  {
    name: 'Community',
    items: [
      { name: 'Members', href: '/admin/members', icon: Users },
      { name: 'Ministries', href: '/admin/ministries', icon: BookOpen },
      { name: 'Prayers', href: '/admin/prayers', icon: MessageSquare },
    ]
  },
  {
    name: 'Operations',
    items: [
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { name: 'System Settings', href: '/admin/settings', icon: Settings },
    ]
  }
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isCouncil, isMinistryLeader } = useAuth();

  const isAllowed = (itemName: string) => {
    if (isSuperAdmin || isAdmin) return true;
    if (isCouncil) {
      return ['Members', 'Prayers', 'Announcements', 'Blogs', 'Dashboard'].includes(itemName);
    }
    if (isMinistryLeader) {
      return ['Ministries', 'Media/Gallery', 'Dashboard'].includes(itemName);
    }
    return false;
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Site</span>
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          {adminGroups.map((group) => {
            const filteredItems = group.items.filter(item => isAllowed(item.name));
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.name} className="space-y-2">
                <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  {group.name}
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                        location.pathname === item.href
                          ? "bg-maroon text-white shadow-lg shadow-maroon/20"
                          : "hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <Link
            to="/member/dashboard"
            onClick={onClose}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Member Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
