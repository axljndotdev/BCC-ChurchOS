import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Clock,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
  Info,
  Flame,
  Wind,
  ArrowRight,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { 
  getPrayerRequests, 
  addPrayerRequest, 
  prayForRequest, 
  addPrayerComment,
  getPrayerComments,
  getCampaignData,
  deletePrayerRequest
} from '../services/db';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { PrayerRequest, PrayerComment } from '../types';

export default function MemberPrayer() {
  const { user, profile, isSuperAdmin, isAdmin } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'community' | 'personal'>('community');
  const [searchTerm, setSearchTerm] = useState('');
  const [acCampaign, setAcCampaign] = useState<{ currentAmount: number; targetAmount: number } | null>(null);
  
  // Form State
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [targetType, setTargetType] = useState<'myself' | 'others'>('myself');
  const [onBehalfOf, setOnBehalfOf] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Request (for viewing details/comments)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const approved = await getPrayerRequests('approved');
      const answered = await getPrayerRequests('answered');
      let combined = [...approved, ...answered].sort((a, b) => {
        const dateA = a.date?.toMillis?.() || new Date(a.date).getTime();
        const dateB = b.date?.toMillis?.() || new Date(b.date).getTime();
        return dateB - dateA;
      });

      // If we're looking at personal requests, we should also fetch non-approved ones for the current user
      if (user) {
        const allUserRequests = await getPrayerRequests(undefined, true);
        const myRequests = allUserRequests.filter(r => r.userId === user.uid);
        
        if (activeTab === 'personal') {
          setRequests(myRequests);
        } else {
          setRequests(combined);
        }
      } else {
        setRequests(combined);
      }
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrayer = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this prayer request? This action cannot be undone.')) return;
    try {
      const ok = await deletePrayerRequest(requestId);
      if (ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error('Error deleting prayer:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fetch Project AC campaign overview for Member Prayer Wall
  useEffect(() => {
    const fetchAC = async () => {
      try {
        const data = await getCampaignData('project-ac');
        if (data) {
          setAcCampaign({
            currentAmount: Number(data.currentAmount || 0),
            targetAmount: Number(data.targetAmount || 800000)
          });
        }
      } catch (err) {
        console.warn('Could not load project AC settings in prayer wall:', err);
      }
    };
    fetchAC();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addPrayerRequest({
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Member',
        message: message.trim(),
        isAnonymous,
        visibility,
        targetType,
        onBehalfOf: targetType === 'others' ? onBehalfOf : undefined,
      });
      setMessage('');
      setOnBehalfOf('');
      setActiveTab('personal');
      alert('Your prayer request has been submitted for moderation.');
    } catch (error) {
      console.error('Error submitting prayer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePray = async (requestId: string) => {
    if (!user) return;
    try {
      await prayForRequest(requestId, user.uid);
      fetchData();
    } catch (error) {
      console.error('Error praying:', error);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.onBehalfOf && r.onBehalfOf.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (!r.isAnonymous && r.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Prayer Garden</h1>
          <p className="text-slate-500 font-light">A sanctuary for our community to lift each other up.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('community')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === 'community' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Community Wall
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === 'personal' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            My Requests
          </button>
        </div>
      </header>

      {/* Project AC Campaign Feature on Member's Prayer Wall */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl border border-slate-700/60">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                Church Project
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold">
                <Wind className="w-3 h-3 text-cyan-300" />
                Sanctuary Air Conditioning
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Project AC — Prayer & Pledge Campaign
            </h2>
            
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Join our church family in lifting up Project AC. Intercede for God's provision, read church member prayers, post your prayer or encouragement, and support the sanctuary air conditioning fund.
            </p>

            {acCampaign && (
              <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-300">
                <span>Raised: <strong className="text-white font-bold">₱{acCampaign.currentAmount.toLocaleString()}</strong></span>
                <span className="text-slate-500">•</span>
                <span>Goal: <strong className="text-white font-bold">₱{acCampaign.targetAmount.toLocaleString()}</strong></span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">
                  {Math.round((acCampaign.currentAmount / acCampaign.targetAmount) * 100)}% Funded
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              to="/project-ac"
              className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Go to Project AC</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
            <input
              type="text"
              placeholder="Search prayers..."
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-maroon" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredRequests.map((request, i) => (
                  <PrayerCard 
                    key={request.id} 
                    request={request} 
                    currentUserId={user?.uid}
                    onPray={() => handlePray(request.id)}
                    index={i}
                    canDelete={isSuperAdmin || isAdmin || (!!user && request.userId === user.uid)}
                    onDelete={() => handleDeletePrayer(request.id)}
                  />
                ))}
              </AnimatePresence>

              {filteredRequests.length === 0 && (
                <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Inner Peace</h3>
                  <p className="text-slate-500 font-light">No prayers found here. Be the first to lift a request.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-maroon" />
              Share a Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTargetType('myself')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    targetType === 'myself' ? "bg-white shadow-sm text-maroon" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  For Myself
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('others')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    targetType === 'others' ? "bg-white shadow-sm text-maroon" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  For Someone
                </button>
              </div>

              {targetType === 'others' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Whom should we pray for?</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. My daughter, Brother Mark..."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-maroon/20 focus:bg-white outline-none transition-all text-sm"
                    value={onBehalfOf}
                    onChange={(e) => setOnBehalfOf(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Your Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your burden or praise..."
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus:border-maroon/20 focus:bg-white outline-none transition-all text-sm resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">Post Anonymously</span>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-all relative",
                    isAnonymous ? "bg-maroon" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                      isAnonymous ? "right-0.5" : "left-0.5"
                    )} />
                  </div>
                </div>

                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setVisibility(visibility === 'public' ? 'private' : 'public')}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-600">Private Request</span>
                      <span className="text-[10px] text-slate-400">Only Elders will see this</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-all relative",
                    visibility === 'private' ? "bg-maroon" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                      visibility === 'private' ? "right-0.5" : "left-0.5"
                    )} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-4 bg-maroon text-white rounded-2xl font-bold text-sm hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Share Request
              </button>
            </form>
          </div>

          {/* Project AC Quick Access Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700 text-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Project AC Sanctuary</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[9px] font-bold uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Dedicate a prayer for our Sanctuary AC, read intercessions from members, or make a pledge towards the fund.
            </p>
            <Link
              to="/project-ac"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider group pt-1"
            >
              <span>View Project AC Page</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrayerCard({ 
  request, 
  currentUserId, 
  onPray, 
  index,
  canDelete,
  onDelete
}: { 
  request: PrayerRequest, 
  currentUserId?: string, 
  onPray: () => void, 
  index: number,
  canDelete?: boolean,
  onDelete?: () => void
}) {
  const hasPrayed = currentUserId && request.prayers?.includes(currentUserId);
  const showName = request.isAnonymous ? 'Anonymous' : request.userName;
  const isOwner = currentUserId === request.userId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-white p-6 rounded-3xl border transition-all duration-300",
        isOwner ? "border-maroon/10 shadow-sm" : "border-slate-100 hover:border-slate-200",
        request.status === 'answered' && "bg-green-50/10 border-green-50"
      )}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg border",
            request.onBehalfOf ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-maroon/5 border-maroon/10 text-maroon"
          )}>
            {request.onBehalfOf ? request.onBehalfOf.charAt(0) : (showName?.charAt(0) || '?')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900">
                {request.onBehalfOf ? `${request.onBehalfOf}` : showName}
              </h4>
              {request.onBehalfOf && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold uppercase tracking-widest">
                  Intercession
                </span>
              )}
              {isOwner && (
                <span className="px-2 py-0.5 bg-maroon/5 text-maroon rounded text-[10px] font-bold uppercase tracking-widest">
                  Me
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(request.date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {request.status === 'answered' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-xs font-bold ring-1 ring-green-100">
              <CheckCircle2 className="h-3.5 w-3.5" /> Answered
            </div>
          ) : request.status === 'pending' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold ring-1 ring-amber-100">
              <Clock className="h-3.5 w-3.5" /> Moderation
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold ring-1 ring-slate-100">
              <Clock className="h-3.5 w-3.5" /> Praying
            </div>
          )}
          {request.visibility === 'private' && (
            <div className="p-1.5 bg-slate-100 text-slate-400 rounded-xl" title="Private to Elders">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Delete prayer item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 mb-8">
        <p className="text-slate-700 leading-relaxed italic font-light whitespace-pre-wrap">
          "{request.message}"
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onPray}
            disabled={hasPrayed || !currentUserId}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
              hasPrayed 
                ? "bg-red-50 text-red-600" 
                : "bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 active:scale-95"
            )}
          >
            <Heart className={cn("h-4 w-4", hasPrayed && "fill-current")} />
            {hasPrayed ? 'Prayed' : 'Pray'}
          </button>
          
          <div className="h-8 w-px bg-slate-100 mx-1" />

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Support Received</span>
            <span className="text-xs font-bold text-slate-900">{request.prayers?.length || 0} souls prayed</span>
          </div>
        </div>

        <Link 
          to={isOwner ? `/member/prayer` : `/prayer`} 
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-maroon transition-colors group"
        >
          View Conversation
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
