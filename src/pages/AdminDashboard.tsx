import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Video, 
  Calendar, 
  Megaphone, 
  MessageSquare, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Loader2,
  Shield,
  Activity,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Settings,
  Globe,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getSermons, 
  getEvents, 
  getPrayerRequests, 
  getUsers, 
  getMembershipInquiries, 
  getPendingMinistryEdits, 
  getRecentActivity,
  getSystemSettings,
  updateSystemSettings,
  getBlogPosts
} from '../services/db';
import { formatDate, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function AdminDashboard() {
  const { isSuperAdmin, isAdmin, isMediaTeam, user } = useAuth();
  const [stats, setStats] = useState({
    members: 0,
    sermons: 0,
    events: 0,
    pendingPrayers: 0,
    inquiries: 0,
    pendingEdits: 0,
    pendingBlogs: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          users, 
          sermons, 
          events, 
          prayers, 
          inquiries, 
          edits, 
          blogs,
          activity,
          sysSettings
        ] = await Promise.all([
          getUsers(),
          getSermons(100),
          getEvents(),
          getPrayerRequests('pending'),
          getMembershipInquiries(),
          getPendingMinistryEdits(),
          getBlogPosts('pending', 50),
          getRecentActivity(),
          getSystemSettings()
        ]);

        setStats({
          members: users.length,
          sermons: sermons.length,
          events: events.length,
          pendingPrayers: prayers.length,
          inquiries: inquiries.filter(i => i.status === 'new').length,
          pendingEdits: edits.length,
          pendingBlogs: blogs.length
        });
        
        setRecentActivity(activity);
        setSettings(sysSettings || { facebookLiveUrl: '', isLive: false });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleLive = async () => {
    if (!settings) return;
    setUpdatingSettings(true);
    try {
      const newStatus = !settings.isLive;
      await updateSystemSettings({ 
        isLive: newStatus,
        updatedBy: user?.displayName || 'Admin'
      });
      setSettings({ ...settings, isLive: newStatus });
    } catch (error) {
      console.error('Error updating live status:', error);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleUpdateLiveUrl = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('liveUrl') as string;
    
    setUpdatingSettings(true);
    try {
      await updateSystemSettings({ 
        facebookLiveUrl: url,
        updatedBy: user?.displayName || 'Admin'
      });
      setSettings({ ...settings, facebookLiveUrl: url });
    } catch (error) {
      console.error('Error updating live URL:', error);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const cards = [
    { label: 'Total Members', value: stats.members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/members' },
    { label: 'New Inquiries', value: stats.inquiries, icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/members' },
    { label: 'Pending Blogs', value: stats.pendingBlogs, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/blogs' },
    { label: 'Ministry Edits', value: stats.pendingEdits, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/ministries' },
  ];

  // Mock data for chart
  const chartData = [
    { name: 'Jan', members: 45 },
    { name: 'Feb', members: 52 },
    { name: 'Mar', members: 61 },
    { name: 'Apr', members: 68 },
    { name: 'May', members: stats.members || 75 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-maroon animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Admin Command Center
          </h1>
          <p className="text-slate-500 font-light">
            Real-time overview of church operations and community growth.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link 
            to="/admin/members"
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Manage Members
          </Link>
          <Link 
            to="/admin/announcements"
            className="flex-1 sm:flex-none px-4 py-2 bg-maroon text-white rounded-xl text-sm font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 flex items-center justify-center"
          >
            New Announcement
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {(isSuperAdmin || isAdmin || isMediaTeam) && (
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-50 rounded-2xl">
                    <Video className="h-6 w-6 text-red-600" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-maroon transition-colors" />
                </div>
                <p className="text-3xl font-display font-bold text-slate-900">{stats.sermons}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Total Sermons</p>
              </div>
            )}
            {cards.map((card, i) => (
              <Link 
                key={i} 
                to={card.link}
                className={cn(
                  "bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group",
                  (!isSuperAdmin && !isAdmin && !isMediaTeam) && "hidden"
                )}
              >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", card.bg)}>
                <card.icon className={cn("h-6 w-6", card.color)} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-maroon transition-colors" />
            </div>
            <p className="text-3xl font-display font-bold text-slate-900">{card.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Membership Growth Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900">Membership Growth</h2>
                <p className="text-sm text-slate-500 font-light">Monthly registration trends</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="h-3 w-3" /> +12% this month
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#800000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="members" 
                    stroke="#800000" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMembers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Facebook Live Control */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Facebook Live Stream</h2>
                  <p className="text-sm text-slate-500 font-light">Control the live broadcast visibility</p>
                </div>
              </div>
              <button 
                onClick={handleToggleLive}
                disabled={updatingSettings}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  settings?.isLive 
                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                )}
              >
                {updatingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : settings?.isLive ? (
                  <>Stop Broadcast</>
                ) : (
                  <>Go Live</>
                )}
              </button>
            </div>

            <form onSubmit={handleUpdateLiveUrl} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="url" 
                  name="liveUrl"
                  defaultValue={settings?.facebookLiveUrl}
                  placeholder="Paste Facebook Live URL here..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                  required
                />
                <button 
                  type="submit"
                  disabled={updatingSettings}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Update URL
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                Last updated by {settings?.updatedBy || 'System'}
              </p>
            </form>
          </div>
        </div>

        {/* Sidebar Activity Feed */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
            <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-maroon-light" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/admin/events" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center justify-between group">
                <span className="text-sm font-medium">Create Event</span>
                <Calendar className="h-4 w-4 text-slate-500 group-hover:text-white" />
              </Link>
              {(isSuperAdmin || isAdmin) && (
                <Link to="/admin/sermons" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center justify-between group">
                  <span className="text-sm font-medium">Upload Sermon</span>
                  <Video className="h-4 w-4 text-slate-500 group-hover:text-white" />
                </Link>
              )}
              <Link to="/admin/ministries" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center justify-between group">
                <span className="text-sm font-medium">Review Edits</span>
                <Shield className="h-4 w-4 text-slate-500 group-hover:text-white" />
              </Link>
              <Link to="/admin/blogs" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center justify-between group">
                <span className="text-sm font-medium">Review Blogs</span>
                <FileText className="h-4 w-4 text-slate-500 group-hover:text-white" />
              </Link>
              {(isSuperAdmin || isAdmin) && (
                <Link to="/admin/settings" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center justify-between group">
                  <span className="text-sm font-medium">Edit Basics</span>
                  <Settings className="h-4 w-4 text-slate-500 group-hover:text-white" />
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-display font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-maroon" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {recentActivity.map((item, i) => (
                <div key={i} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                      item.type === 'member' ? "bg-blue-50 text-blue-600" :
                      item.type === 'sermon' ? "bg-purple-50 text-purple-600" :
                      item.type === 'prayer' ? "bg-red-50 text-red-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                      {item.type === 'member' ? <Users className="h-4 w-4" /> :
                       item.type === 'sermon' ? <Video className="h-4 w-4" /> :
                       item.type === 'prayer' ? <MessageSquare className="h-4 w-4" /> :
                       <Globe className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 font-medium leading-tight mb-1">{item.text}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm font-light">
                  No recent activity logged.
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 text-center">
              <button className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-maroon transition-colors">
                View Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
