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
  User,
  Heart,
  CheckCircle2,
  ChevronRight,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, cn } from '../lib/utils';
import { applyForMembership, getAnnouncements, getEvents, getPrayerRequests, getSermons, prayForRequest } from '../services/db';
import { useState, useEffect } from 'react';
import { ROLE_INFO } from '../constants';
import { Announcement, PrayerRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [activePrayerTab, setActivePrayerTab] = useState<'all' | 'mine'>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const fetchData = async () => {
    try {
      const [pr, ev, sr, an] = await Promise.all([
        getPrayerRequests('approved'),
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
      setPrayers(pr.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePray = async (requestId: string) => {
    if (!profile) return;
    try {
      await prayForRequest(requestId, profile.uid);
      fetchData();
    } catch (error) {
      console.error('Error adding prayer:', error);
    }
  };

  const userRoles = Array.isArray(profile?.role) ? profile.role : (profile?.role ? [profile.role] : ['member']);
  const primaryRole = userRoles[0] as any;
  const roleInfo = ROLE_INFO[primaryRole];

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
          {userRoles.map((role) => (
            <div key={role} className="group relative">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-help",
                role === 'super_admin' || role === 'church_admin' ? "bg-maroon text-white" : "bg-slate-100 text-slate-500"
              )}>
                {ROLE_INFO[role as any]?.label || 'Member'}
                <Info className="h-3 w-3 opacity-50" />
              </span>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                <p className="font-bold mb-1 uppercase tracking-wider text-white/50">{ROLE_INFO[role as any]?.label}</p>
                <p className="leading-relaxed">{ROLE_INFO[role as any]?.description}</p>
              </div>
            </div>
          ))}
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
              <div 
                key={i} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-maroon/20 transition-all cursor-pointer group"
                onClick={() => setSelectedAnnouncement(item)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-maroon transition-colors">{item.title}</h3>
                  <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{item.content}</p>
                <div className="mt-4 flex justify-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-maroon transition-colors">Read More</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcement Detail Modal */}
        <AnimatePresence>
          {selectedAnnouncement && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
              >
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="absolute top-8 right-8 text-slate-400 hover:text-maroon transition-colors p-2"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="overflow-y-auto pr-4 custom-scrollbar">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-maroon uppercase tracking-widest">
                      <span className="h-2 w-2 bg-maroon rounded-full"></span>
                      {formatDate(selectedAnnouncement.date)}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display text-slate-900 leading-tight">
                      {selectedAnnouncement.title}
                    </h2>
                    <div className="w-12 h-px bg-maroon/20" />
                    <p className="text-slate-600 font-light text-lg leading-relaxed whitespace-pre-wrap">
                      {selectedAnnouncement.content}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end">
                  <button 
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-maroon transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Community Prayer Wall */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Prayer Wall
              </h2>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setActivePrayerTab('all')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                    activePrayerTab === 'all' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Community
                </button>
                <button 
                  onClick={() => setActivePrayerTab('mine')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                    activePrayerTab === 'mine' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  My Requests
                </button>
              </div>
            </div>
            <Link to="/prayer" className="text-sm text-maroon font-medium hover:underline flex items-center gap-1">
              Go to Wall <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {prayers
                .filter(p => activePrayerTab === 'mine' ? p.userId === profile?.uid : true)
                .map((request, i) => {
                  const hasPrayed = profile && request.prayers?.includes(profile.uid);
                  const showName = request.isAnonymous ? 'Anonymous' : request.userName;
                  
                  return (
                    <motion.div
                      key={request.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-maroon/20 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-maroon border border-slate-200">
                            {request.onBehalfOf ? request.onBehalfOf.charAt(0) : (showName?.charAt(0) || '?')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              {request.onBehalfOf ? `For ${request.onBehalfOf}` : showName}
                            </p>
                            <p className="text-[10px] text-slate-400 capitalize">{formatDate(request.date)}</p>
                          </div>
                        </div>
                        {request.status === 'answered' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      
                      <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3 italic">
                        "{request.message}"
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {request.prayers?.length || 0} Praying
                        </span>
                        <button
                          onClick={() => handlePray(request.id)}
                          disabled={hasPrayed}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                            hasPrayed 
                              ? "bg-red-50 text-red-500" 
                              : "bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-500"
                          )}
                        >
                          <Heart className={cn("h-3 w-3", hasPrayed && "fill-current")} />
                          {hasPrayed ? 'Praying' : 'Pray'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
            
            {prayers.filter(p => activePrayerTab === 'mine' ? p.userId === profile?.uid : true).length === 0 && (
              <div className="col-span-full py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No prayer requests in this category yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {[
              { label: 'Submit Prayer Request', href: '/member/prayer', icon: MessageSquare },
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
