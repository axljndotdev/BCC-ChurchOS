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
  FileText,
  Wind,
  Edit3,
  X,
  Heart,
  MessageCircle,
  FolderDown
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
  getBlogPosts,
  getCampaignData,
  saveCampaignData,
  getChurchComments,
  getResources,
  DEFAULT_AC_CAMPAIGN
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
  const { isSuperAdmin, isAdmin, isMediaTeam, isCouncil, user } = useAuth();
  const [stats, setStats] = useState({
    members: 0,
    sermons: 0,
    events: 0,
    pendingPrayers: 0,
    inquiries: 0,
    pendingEdits: 0,
    pendingBlogs: 0,
    comments: 0,
    resources: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Project AC Campaign state for SuperAdmin
  const [campaign, setCampaign] = useState<any>(DEFAULT_AC_CAMPAIGN);
  const [isACModalOpen, setIsACModalOpen] = useState(false);
  const [acGoal, setAcGoal] = useState(800000);
  const [acRaised, setAcRaised] = useState(150000);
  const [acMission, setAcMission] = useState('');
  const [savingAC, setSavingAC] = useState(false);
  const [acSuccess, setAcSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const safeFetch = async (fetcher: () => Promise<any>, defaultValue: any = []) => {
          try {
            return await fetcher();
          } catch (e) {
            console.warn(`Admin Dashboard: Soft failure in data fetch:`, e);
            return defaultValue;
          }
        };

        const [
          users, 
          sermons, 
          events, 
          prayers, 
          inquiries, 
          edits, 
          blogs,
          churchComments,
          resourcesList,
          activity,
          sysSettings,
          acData
        ] = await Promise.all([
          safeFetch(() => getUsers()),
          safeFetch(() => getSermons(100)),
          safeFetch(() => getEvents()),
          safeFetch(() => getPrayerRequests('pending')),
          safeFetch(() => getMembershipInquiries()),
          safeFetch(() => getPendingMinistryEdits()),
          safeFetch(() => getBlogPosts('pending', 50)),
          safeFetch(() => getChurchComments()),
          safeFetch(() => getResources(true)),
          safeFetch(() => getRecentActivity()),
          safeFetch(() => getSystemSettings(), { facebookLiveUrl: '', isLive: false }),
          safeFetch(() => getCampaignData('project-ac'), DEFAULT_AC_CAMPAIGN)
        ]);

        setStats({
          members: users.length,
          sermons: sermons.length,
          events: events.length,
          pendingPrayers: prayers.length,
          inquiries: inquiries.filter((i: any) => i.status === 'new').length,
          pendingEdits: edits.length,
          pendingBlogs: blogs.length,
          comments: churchComments.length,
          resources: resourcesList.length
        });
        
        setRecentActivity(activity);
        setSettings(sysSettings || { facebookLiveUrl: '', isLive: false });
        if (acData) {
          setCampaign(acData);
          setAcGoal(acData.targetAmount || 800000);
          setAcRaised(acData.currentAmount || 150000);
          setAcMission(acData.mission || DEFAULT_AC_CAMPAIGN.mission);
        }
      } catch (error) {
        console.error('Critical Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveAC = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAC(true);
    try {
      const updated = await saveCampaignData('project-ac', {
        targetAmount: Number(acGoal),
        currentAmount: Number(acRaised),
        mission: acMission
      }, { displayName: user?.displayName || 'Super Admin', email: user?.email || undefined });
      setCampaign(updated);
      setAcSuccess(true);
      setTimeout(() => {
        setAcSuccess(false);
        setIsACModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Error saving AC settings in Admin:', err);
    } finally {
      setSavingAC(false);
    }
  };

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
    { label: 'Comments & Feed', value: stats.comments, icon: MessageCircle, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/comments' },
    { label: 'Resources & Files', value: stats.resources, icon: FolderDown, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/resources' },
    { label: 'New Inquiries', value: stats.inquiries, icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/members' },
    { label: 'Pending Blogs', value: stats.pendingBlogs, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/blogs' },
    { label: 'Ministry Edits', value: stats.pendingEdits, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/ministries' },
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
            {isSuperAdmin ? 'SuperAdmin Command Center' : 'Admin Command Center'}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {(isSuperAdmin || isAdmin || isMediaTeam || isCouncil) && (
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
                  (!isSuperAdmin && !isAdmin && !isMediaTeam && !isCouncil) && "hidden"
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

      {/* Project AC Campaign SuperAdmin Management Card */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
                <Wind className="w-3.5 h-3.5" />
                <span>Superadmin Feature Control</span>
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-3">
                <span>Project AC Fundraising Campaign</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                Church Sanctuary Air Conditioning. You can update the live goal budget, total amount raised to date, and mission statement anytime.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsACModalOpen(true)}
                className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit AC Figures</span>
              </button>
              <Link
                to="/project-ac"
                className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <span>View Live Page</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Progress & Live Numbers */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/60">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Fundraising Goal
              </span>
              <p className="text-2xl font-black text-white">
                ₱{Number(campaign?.targetAmount || 800000).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Full budget needed</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Amount Raised To Date
              </span>
              <p className="text-2xl font-black text-red-400">
                ₱{Number(campaign?.currentAmount || 150000).toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {(((campaign?.currentAmount || 150000) / (campaign?.targetAmount || 800000)) * 100).toFixed(1)}% Achieved
              </span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Remaining Balance
              </span>
              <p className="text-2xl font-black text-slate-200">
                ₱{Math.max(0, (campaign?.targetAmount || 800000) - (campaign?.currentAmount || 150000)).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">By God's grace</span>
            </div>
          </div>
        </div>
      )}

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
              {isSuperAdmin && (
                <button 
                  onClick={() => setIsACModalOpen(true)}
                  className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl transition-all flex items-center justify-between group text-left"
                >
                  <span className="text-sm font-bold text-red-300 group-hover:text-white flex items-center gap-2">
                    <Wind className="w-4 h-4 text-red-400" />
                    Edit Project AC Figures
                  </span>
                  <Edit3 className="h-4 w-4 text-red-400 group-hover:text-white" />
                </button>
              )}
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

      {/* Superadmin Project AC Edit Modal */}
      {isACModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsACModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">
                  Update Project AC Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Superadmin Only • Live public sync
                </p>
              </div>
            </div>

            {acSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Successfully Updated!</h4>
                <p className="text-xs text-slate-500">Project AC figures and campaign details are saved.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveAC} className="space-y-4">
                {/* Target Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fundraising Goal / Budget
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={acGoal}
                    onChange={(e) => setAcGoal(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Currently: ₱{Number(acGoal).toLocaleString()}</p>
                </div>

                {/* Raised Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Amount Raised to Date
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={acRaised}
                    onChange={(e) => setAcRaised(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Currently: ₱{Number(acRaised).toLocaleString()} ({((acRaised / (acGoal || 1)) * 100).toFixed(1)}%)
                  </p>
                </div>

                {/* Mission Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Campaign Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    value={acMission}
                    onChange={(e) => setAcMission(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                    placeholder="Brief description of the sanctuary cooling project..."
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsACModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAC}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingAC ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Save Live Figures
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
