import { useAuth } from '../contexts/AuthContext';
import { 
  Megaphone, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Clock, 
  UserPlus, 
  Info, 
  Loader2, 
  PenTool, 
  Video,
  AlertTriangle,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, cn } from '../lib/utils';
import { applyForMembership, getAnnouncements, getEvents, getPrayerRequests, getSermons } from '../services/db';
import { useState, useEffect } from 'react';
import { ROLE_INFO } from '../constants';
import { Announcement } from '../types';
import { motion } from 'motion/react';

export default function MemberDashboard() {
  const { profile, isAdmin, isCouncil, isMinistryLeader, isSuperAdmin } = useAuth();
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    prayerRequests: 0,
    events: 0,
    sermons: 0,
    announcements: 0
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pr, ev, sr, an] = await Promise.all([
          getPrayerRequests(),
          getEvents(),
          getSermons(10),
          getAnnouncements(5)
        ]);

        setStats({
          prayerRequests: pr.length,
          events: ev.length,
          sermons: sr.length,
          announcements: an.length
        });
        setAnnouncements(an);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const roleInfo = profile ? ROLE_INFO[profile.role] : null;

  const handleApply = async () => {
    if (!profile) return;
    setApplying(true);
    try {
      await applyForMembership(profile.uid);
    } catch (error) {
      console.error('Error applying for membership:', error);
      alert('Failed to submit application. Please try again later.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-maroon animate-spin" />
      </div>
    );
  }

  const canEditBlog = profile?.isBlogEditor || isCouncil || isAdmin || isSuperAdmin;

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="group relative">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-help",
              isAdmin || isSuperAdmin ? "bg-maroon text-white" : "bg-slate-100 text-slate-500"
            )}>
              {roleInfo?.label || 'Church Member'}
              <Info className="h-3 w-3 opacity-50" />
            </span>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
              <p className="font-bold mb-1 uppercase tracking-wider text-white/50">{roleInfo?.label}</p>
              <p className="leading-relaxed">{roleInfo?.description}</p>
            </div>
          </div>
          {profile?.ministry && !isAdmin && !isSuperAdmin && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500">
              {profile.ministry}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-maroon flex items-center justify-center text-white font-display font-bold text-2xl overflow-hidden shadow-xl shadow-maroon/20">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              profile?.displayName?.charAt(0) || 'U'
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-display text-slate-900 font-bold tracking-tight">Welcome back, {profile?.displayName}</h1>
            <p className="text-slate-500 font-light italic">Here's what's happening in your church community.</p>
          </div>
        </div>
      </header>

      {/* Profile Completion Prompt */}
      {(!profile?.address || !profile?.contactNumber) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
            <User className="h-8 w-8 text-amber-500" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="text-lg font-bold text-amber-900">Complete Your Member Profile</h3>
            <p className="text-amber-700/80 font-light text-sm">We encourage you to add your address and contact details to help the church stay in touch.</p>
          </div>
          <Link 
            to="/member/profile"
            className="px-8 py-3 bg-white text-amber-700 rounded-2xl font-bold shadow-sm border border-amber-200 hover:bg-amber-100 transition-all whitespace-nowrap"
          >
            Go to Settings
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Prayer Requests', value: stats.prayerRequests.toString(), icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Upcoming Events', value: stats.events.toString(), icon: Calendar, color: 'text-maroon', bg: 'bg-maroon/10' },
          { label: 'New Resources', value: stats.sermons.toString(), icon: BookOpen, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Announcements', value: stats.announcements.toString(), icon: Megaphone, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <span className="text-3xl font-display text-slate-900">{stat.value}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-maroon" />
              Latest Announcements
            </h2>
            <Link to="/member/announcements" className="text-sm text-maroon font-medium hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {announcements.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-maroon/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {[
              { label: 'Submit Prayer Request', href: '/prayer', icon: MessageSquare },
              { label: 'Watch Live', href: '/live', icon: Video },
              { label: 'Profile Settings', href: '/member/profile', icon: User },
              { label: 'Upcoming Events', href: '/member/events', icon: Calendar },
              { label: 'Member Directory', href: '/member/directory', icon: Users },
              ...(canEditBlog ? [{ label: 'Write a Blog Post', href: '/member/blog/new', icon: PenTool }] : []),
            ].map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>

          <div className="bg-maroon rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-2 text-white">Need Help?</h3>
            <p className="text-sm text-white/80 mb-4">Our team is here to support you. Reach out for any assistance.</p>
            <Link to="/contact" className="text-sm font-bold bg-white text-maroon px-4 py-2 rounded-lg inline-block hover:bg-slate-100 transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
