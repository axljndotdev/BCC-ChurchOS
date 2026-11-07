import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getPrayerRequests, 
  addPrayerRequest, 
  prayForRequest, 
  addPrayerComment, 
  getPrayerComments,
  deletePrayerRequest,
  deletePrayerComment
} from '../services/db';
import { PrayerRequest, PrayerComment } from '../types';
import { MessageSquare, Send, CheckCircle2, Clock, Heart, Loader2, ShieldCheck, Globe, ChevronRight, Trash2, PlusCircle, Search } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

function CommentSection({ requestId }: { requestId: string }) {
  const { user, profile, isSuperAdmin, isAdmin } = useAuth();
  const [comments, setComments] = useState<PrayerComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getPrayerComments(requestId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [requestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !profile) return;

    try {
      setSubmitting(true);
      await addPrayerComment(requestId, {
        userId: user.uid,
        userName: profile.displayName,
        message: newComment
      });
      setNewComment('');
      const data = await getPrayerComments(requestId);
      setComments(data);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this encouraging word?')) return;
    try {
      const ok = await deletePrayerComment(requestId, commentId);
      if (ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#E8D5B5]/60 space-y-4">
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#7A121D]/40" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#C99738]/50 before:rounded-full group">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs font-bold text-stone-900">{comment.userName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
                  {(isSuperAdmin || isAdmin || (user && comment.userId === user.uid)) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-red-600 rounded"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                "{comment.message}"
              </p>
            </div>
          ))
        ) : (
          <p className="text-center py-3 text-[10px] text-stone-400 uppercase tracking-widest font-semibold">No words of hope yet. Be the first.</p>
        )}
      </div>
      
      {user && (
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            className="w-full pl-3.5 pr-12 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:bg-white transition-all"
            placeholder="Type a word of encouragement..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-1.5 top-1 p-1.5 bg-[#7A121D] text-white rounded-lg hover:bg-[#5C0612] transition-all disabled:opacity-30 shadow-xs min-h-[32px] min-w-[32px] flex items-center justify-center"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-[#E5B869]" />}
          </button>
        </form>
      )}
    </div>
  );
}

// PrayerCard component for consistency
function PrayerCard({ 
  request, 
  currentUserId, 
  onPray, 
  index, 
  onCommentClick,
  canDelete,
  onDelete
}: { 
  request: PrayerRequest, 
  currentUserId?: string, 
  onPray: () => void, 
  index: number,
  onCommentClick: () => void,
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
        "bg-white p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-xs border transition-all duration-300",
        isOwner ? "border-[#C99738] ring-1 ring-[#C99738]/20 bg-[#FDFBF7]" : "border-[#E8D5B5]/80 hover:border-[#C99738]/60",
        request.status === 'answered' && "bg-emerald-50/20 border-emerald-200"
      )}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={cn(
            "h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold border transition-colors shrink-0",
            request.onBehalfOf 
              ? "bg-[#FAF6EE] border-[#C99738]/40 text-[#9A6F1D]" 
              : "bg-[#7A121D] border-[#C99738]/40 text-[#E5B869]"
          )}>
            {request.onBehalfOf ? request.onBehalfOf.charAt(0) : (showName?.charAt(0) || '?')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-bold text-base sm:text-lg text-stone-900 font-display">
                {request.onBehalfOf ? `Prayer for ${request.onBehalfOf}` : 'Prayer Request'}
              </h3>
              {request.onBehalfOf && (
                <span className="px-2 py-0.5 bg-[#FAF6EE] text-[#9A6F1D] border border-[#E8D5B5] rounded text-[9px] font-bold uppercase tracking-widest leading-none">Intercession</span>
              )}
              {isOwner && (
                <span className="px-2 py-0.5 bg-[#7A121D]/10 text-[#7A121D] rounded text-[9px] font-bold uppercase tracking-widest leading-none">My Request</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">By {showName}</p>
              <span className="text-stone-300 text-xs">•</span>
              <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">{formatDate(request.date)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {request.status === 'answered' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" /> Answered
            </div>
          ) : request.status === 'pending' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200">
              <Clock className="h-3 w-3" /> Moderation
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EE] text-[#7A121D] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#E8D5B5]">
              <Clock className="h-3 w-3 text-[#C99738]" /> Praying
            </div>
          )}

          {canDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
              title="Delete prayer item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-stone-700 leading-relaxed font-light text-sm sm:text-base mb-6 whitespace-pre-wrap">
        "{request.message}"
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-[#E8D5B5]/60">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={onPray}
            disabled={!currentUserId || hasPrayed}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xs active:scale-95 disabled:active:scale-100 min-h-[40px]",
              hasPrayed 
                ? "bg-rose-50 text-[#7A121D] ring-1 ring-[#7A121D]/20" 
                : "bg-[#7A121D] text-white hover:bg-[#5C0612] border border-[#C99738]/60"
            )}
          >
            <Heart className={cn("h-4 w-4", hasPrayed ? "fill-current" : "text-[#E5B869]")} /> 
            {hasPrayed ? 'Lifted in Prayer' : "I will pray"}
          </button>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Support</span>
            <span className="text-xs font-bold text-stone-900">{request.prayCount || 0} praying</span>
          </div>
        </div>

        <button 
          onClick={onCommentClick}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-[#7A121D] transition-colors min-h-[36px]"
        >
          <MessageSquare className="h-4 w-4 text-[#C99738]" /> 
          <span>Words of Hope</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function PrayerWall() {
  const { user, profile, isSuperAdmin, isAdmin } = useAuth();
  const { pageData } = useCMS('prayer');
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  
  // Tabs: 'wall' | 'my-prayers' | 'submit' (for mobile-first responsiveness)
  const [activeTab, setActiveTab] = useState<'wall' | 'my-prayers' | 'submit'>('wall');
  
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'myself' | 'others'>('myself');
  const [onBehalfOf, setOnBehalfOf] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [sensitivityNote, setSensitivityNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    try {
      const approved = await getPrayerRequests('approved');
      const answered = await getPrayerRequests('answered');
      setRequests([...approved, ...answered].sort((a, b) => {
        const dateA = a.date?.toMillis?.() || new Date(a.date).getTime();
        const dateB = b.date?.toMillis?.() || new Date(b.date).getTime();
        return dateB - dateA;
      }));

      if (user) {
        const allUserRequests = await getPrayerRequests(undefined, true);
        setMyRequests(allUserRequests.filter(r => r.userId === user.uid));
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
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
        setMyRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.error('Failed to delete prayer request:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      
      const requestData = {
        userId: user?.uid || 'guest',
        userName: user ? (profile?.displayName || 'Member') : (guestName || 'Guest'),
        onBehalfOf: targetType === 'others' ? onBehalfOf : undefined,
        message,
        isAnonymous: user ? isAnonymous : !guestName, 
        visibility,
        sensitivityNote: sensitivityNote || undefined
      };

      await addPrayerRequest(requestData);

      setMessage('');
      setOnBehalfOf('');
      setGuestName('');
      setSensitivityNote('');
      
      alert(visibility === 'private' 
        ? 'Your prayer request has been sent privately to our leadership. Thank you for sharing.' 
        : 'Prayer request submitted for approval.');
      
      setActiveTab('wall');
      fetchRequests();
    } catch (error) {
      console.error('Error submitting prayer request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePray = async (requestId: string) => {
    if (!user) return;
    try {
      await prayForRequest(requestId, user.uid);
      const updateFn = (prev: PrayerRequest[]) => prev.map(r => 
        r.id === requestId 
          ? { 
              ...r, 
              prayCount: (r.prayCount || 0) + 1, 
              prayers: [...(r.prayers || []), user.uid] 
            } 
          : r
      );
      setRequests(updateFn);
      setMyRequests(updateFn);
    } catch (error) {
      console.error('Error praying for request:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 min-h-screen space-y-8 sm:space-y-12 pb-32 relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="prayer" pageName="Prayer Garden" />

      {pageData?.hero?.visible !== false && (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 border-b border-[#E8D5B5] pb-6 sm:pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
              <span className="text-[#C99738]">✦</span> {pageData?.hero?.badge || 'Spiritual Support'}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-stone-900 tracking-tight">
              {pageData?.hero?.title || 'Prayer Garden'}
            </h1>
            {pageData?.hero?.subtitle && (
              <p className="text-[#9A6F1D] font-display italic text-sm mt-1">{pageData.hero.subtitle}</p>
            )}
            <p className="text-stone-600 font-light max-w-xl mt-1 text-xs sm:text-sm">
              {pageData?.hero?.description || 'Share your requests and pray for others in our community. A sanctuary for our community to lift each other up.'}
            </p>
          </div>
          
          {/* Navigation Tabs (Responsive Segmented Controls) */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF6EE] border border-[#E8D5B5] rounded-2xl shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('wall')}
              className={cn(
                "flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[38px]",
                activeTab === 'wall' ? "bg-white text-[#7A121D] shadow-xs border border-[#E8D5B5]" : "text-stone-600 hover:text-stone-900"
              )}
            >
              Public Wall
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-prayers')}
                className={cn(
                  "flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[38px]",
                  activeTab === 'my-prayers' ? "bg-white text-[#7A121D] shadow-xs border border-[#E8D5B5]" : "text-stone-600 hover:text-stone-900"
                )}
              >
                My Requests
              </button>
            )}
            <button
              onClick={() => setActiveTab('submit')}
              className={cn(
                "flex-1 sm:flex-none lg:hidden px-4 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[38px] flex items-center justify-center gap-1.5",
                activeTab === 'submit' ? "bg-[#7A121D] text-white shadow-xs" : "text-[#7A121D] hover:bg-white/60"
              )}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Share Request</span>
            </button>
          </div>
        </header>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Sidebar Form: Sticky on Desktop, Tab-Controlled on Mobile */}
        <div className={cn(
          "lg:col-span-1 space-y-6 lg:sticky lg:top-24",
          activeTab === 'submit' ? "block" : "hidden lg:block"
        )}>
          <div className="bg-[#FAF6EE] p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-xs border border-[#E8D5B5]">
            <h2 className="text-lg sm:text-xl font-display font-bold text-stone-900 mb-6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7A121D] text-white flex items-center justify-center border border-[#C99738]/40 shadow-xs">
                <Send className="h-4 w-4 text-[#E5B869]" />
              </div>
              Share a Request
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Type */}
              <div className="flex gap-2 p-1 bg-white rounded-xl border border-[#E8D5B5]">
                <button
                  type="button"
                  onClick={() => setTargetType('myself')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-h-[36px]",
                    targetType === 'myself' ? "bg-[#7A121D] text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  For Myself
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('others')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-h-[36px]",
                    targetType === 'others' ? "bg-[#7A121D] text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  For Someone
                </button>
              </div>

              {targetType === 'others' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider px-1">Who are we praying for?</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-[#E8D5B5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#7A121D] bg-white transition-all"
                    placeholder="Friend, family member, or name..."
                    value={onBehalfOf}
                    onChange={(e) => setOnBehalfOf(e.target.value)}
                  />
                </div>
              )}

              {/* Name & Anonymity */}
              <div className="space-y-2.5">
                {!user ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-600 uppercase tracking-wider px-1">Your Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-[#E8D5B5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#7A121D] bg-white transition-all"
                      placeholder="Your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                    <p className="text-[10px] text-stone-500 px-1 italic">Leave blank to stay anonymous</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1 group cursor-pointer py-1" onClick={() => setIsAnonymous(!isAnonymous)}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#C99738]" />
                      <span className="text-xs font-medium text-stone-700">Post Anonymously</span>
                    </div>
                    <div className={cn(
                      "w-8 h-4 rounded-full transition-all relative",
                      isAnonymous ? "bg-[#7A121D]" : "bg-stone-300"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-xs",
                        isAnonymous ? "right-0.5" : "left-0.5"
                      )} />
                    </div>
                  </div>
                )}
              </div>

              {/* Visibility Choice */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider px-1">Privacy Level</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-left transition-all min-h-[44px]",
                      visibility === 'public' ? "bg-white border-[#C99738] ring-1 ring-[#C99738]/30" : "bg-white/60 border-[#E8D5B5] text-stone-500"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-4 w-4 text-[#C99738]" />
                      <div>
                        <p className="text-xs font-bold text-stone-900">Public Prayer Garden</p>
                        <p className="text-[10px] text-stone-500">Visible to church family</p>
                      </div>
                    </div>
                    {visibility === 'public' && <div className="h-2 w-2 rounded-full bg-[#7A121D]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-left transition-all min-h-[44px]",
                      visibility === 'private' ? "bg-white border-[#C99738] ring-1 ring-[#C99738]/30" : "bg-white/60 border-[#E8D5B5] text-stone-500"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-[#7A121D]" />
                      <div>
                        <p className="text-xs font-bold text-stone-900">Pastoral Confidential</p>
                        <p className="text-[10px] text-stone-500">Pastors & prayer team only</p>
                      </div>
                    </div>
                    {visibility === 'private' && <div className="h-2 w-2 rounded-full bg-[#7A121D]" />}
                  </button>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider px-1">Your Prayer Request</label>
                <textarea
                  rows={4}
                  required
                  className="w-full p-4 border border-[#E8D5B5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#7A121D] bg-white transition-all resize-none"
                  placeholder="Share what is on your heart..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Sensitivity Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider px-1">Special Instructions (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-[#E8D5B5] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#7A121D] bg-white transition-all"
                  placeholder="e.g. Please pray this week..."
                  value={sensitivityNote}
                  onChange={(e) => setSensitivityNote(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full py-3.5 bg-[#7A121D] text-white border border-[#C99738] rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#5C0612] transition-all disabled:opacity-40 shadow-md min-h-[44px] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#E5B869]" />
                    <span>Lifting Up...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-[#E5B869]" />
                    <span>Submit Prayer Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Requests List */}
        <div className={cn(
          "lg:col-span-2 space-y-6 sm:space-y-8",
          activeTab === 'submit' ? "hidden lg:block" : "block"
        )}>
          {/* Search bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Search prayers by keyword or name..."
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-[#E8D5B5] shadow-xs focus:ring-2 focus:ring-[#7A121D] outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#7A121D]" />
              <p className="text-stone-500 font-light text-sm">Gathering community prayers...</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence mode="popLayout">
                {(activeTab === 'my-prayers' ? myRequests : requests)
                  .filter(r => 
                    r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (r.onBehalfOf && r.onBehalfOf.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((request, i) => (
                    <div key={request.id} className="space-y-2">
                      <PrayerCard 
                        request={request}
                        currentUserId={user?.uid}
                        onPray={() => handlePray(request.id)}
                        index={i}
                        onCommentClick={() => setActiveCommentId(activeCommentId === request.id ? null : request.id)}
                        canDelete={isSuperAdmin || isAdmin || (!!user && request.userId === user.uid)}
                        onDelete={() => handleDeletePrayer(request.id)}
                      />
                      <AnimatePresence>
                        {activeCommentId === request.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-[#FAF6EE] rounded-b-2xl px-5 sm:px-8 pb-6 -mt-4 pt-6 border-x border-b border-[#E8D5B5] mx-3">
                              <CommentSection requestId={request.id} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </AnimatePresence>

              {(activeTab === 'my-prayers' ? myRequests : requests).length === 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border border-[#E8D5B5] shadow-xs">
                  <div className="w-14 h-14 bg-[#FAF6EE] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E8D5B5]">
                    <ShieldCheck className="h-7 w-7 text-[#C99738]" />
                  </div>
                  <h3 className="text-xl font-display text-stone-900 mb-2">No Requests Found</h3>
                  <p className="text-stone-500 font-light text-xs sm:text-sm max-w-md mx-auto">
                    {activeTab === 'my-prayers'
                      ? "You haven't submitted any prayer requests yet. Tap 'Share Request' to share your heart."
                      : "No public prayer requests matched your search. Be the first to share a burden or a blessing."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
