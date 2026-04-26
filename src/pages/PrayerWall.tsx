import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPrayerRequests, addPrayerRequest, prayForRequest, addPrayerComment, getPrayerComments } from '../services/db';
import { PrayerRequest, PrayerComment } from '../types';
import { MessageSquare, Send, CheckCircle2, Clock, Heart, Loader2, ShieldCheck, Globe, ChevronRight } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

function CommentSection({ requestId }: { requestId: string }) {
  const { user, profile } = useAuth();
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
      // Refresh comments
      const data = await getPrayerComments(requestId);
      setComments(data);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-maroon/20" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-maroon/10 before:rounded-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900">{comment.userName}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-500 font-light leading-relaxed">
                "{comment.message}"
              </p>
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">No words of hope yet. Be the first.</p>
        )}
      </div>
      
      {user && (
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/10 focus:bg-white transition-all"
            placeholder="Type a word of encouragement..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-2 top-1.5 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-maroon transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-sm"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  );
}

// PrayerCard component for consistency
function PrayerCard({ request, currentUserId, onPray, index, onCommentClick }: { 
  request: PrayerRequest, 
  currentUserId?: string, 
  onPray: () => void, 
  index: number,
  onCommentClick: () => void
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
        "bg-white p-8 rounded-[2rem] shadow-sm border transition-all duration-300",
        isOwner ? "border-maroon/20 shadow-maroon/5 ring-1 ring-maroon/5" : "border-slate-100 hover:border-slate-200",
        request.status === 'answered' && "bg-green-50/10 border-green-50"
      )}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold border transition-colors",
            request.onBehalfOf ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-maroon/5 border-maroon/10 text-maroon"
          )}>
            {request.onBehalfOf ? request.onBehalfOf.charAt(0) : (showName?.charAt(0) || '?')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-lg text-slate-900">
                {request.onBehalfOf ? `Prayer for ${request.onBehalfOf}` : 'Prayer Request'}
              </h3>
              {request.onBehalfOf && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-bold uppercase tracking-widest leading-none">Intercession</span>
              )}
              {isOwner && (
                <span className="px-2 py-0.5 bg-maroon/5 text-maroon rounded text-[9px] font-bold uppercase tracking-widest leading-none">My Request</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">By {showName}</p>
              <span className="text-slate-200 text-xs">•</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(request.date)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {request.status === 'answered' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 ring-green-100">
              <CheckCircle2 className="h-3 w-3" /> Answered
            </div>
          ) : request.status === 'pending' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 ring-amber-100">
              <Clock className="h-3 w-3" /> Moderation
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-maroon/5 text-maroon rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Clock className="h-3 w-3" /> Praying
            </div>
          )}
        </div>
      </div>

      <p className="text-slate-700 leading-[1.8] italic font-light text-lg mb-8 whitespace-pre-wrap">
        "{request.message}"
      </p>

      <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-slate-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onPray}
            disabled={!currentUserId || hasPrayed}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:active:scale-100",
              hasPrayed 
                ? "bg-red-50 text-red-500 ring-1 ring-red-100" 
                : "bg-slate-900 text-white hover:bg-maroon"
            )}
          >
            <Heart className={cn("h-4 w-4", hasPrayed && "fill-current")} /> 
            {hasPrayed ? 'Lifted in Prayer' : "I will pray"}
          </button>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Support Received</span>
            <span className="text-xs font-bold text-slate-900">{request.prayCount || 0} souls prayed</span>
          </div>
        </div>

        <button 
          onClick={onCommentClick}
          className={cn(
            "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all",
            "text-slate-400 hover:text-maroon"
          )}
        >
          <MessageSquare className="h-4 w-4" /> 
          Words of Hope
        </button>
      </div>
    </motion.div>
  );
}

export default function PrayerWall() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'wall' | 'my-prayers'>('wall');
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
      // Fetch approved AND answered for the public wall
      const approved = await getPrayerRequests('approved');
      const answered = await getPrayerRequests('answered');
      setRequests([...approved, ...answered].sort((a, b) => {
        const dateA = a.date?.toMillis?.() || new Date(a.date).getTime();
        const dateB = b.date?.toMillis?.() || new Date(b.date).getTime();
        return dateB - dateA;
      }));

      // Fetch user's own requests if logged in
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
      
      if (user) fetchRequests();
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
      // Optimistic update
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen space-y-12 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Prayer Garden</h1>
          <p className="text-slate-500 font-light max-w-xl">Share your requests and pray for others in our community. A sanctuary for our community to lift each other up.</p>
        </div>
        
        {user && (
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('wall')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'wall' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Public Wall
            </button>
            <button
              onClick={() => setActiveTab('my-prayers')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'my-prayers' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              My Requests
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Sidebar: Submit Request */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-maroon/5 text-maroon flex items-center justify-center shadow-inner">
                <Send className="h-5 w-5" />
              </div>
              Share a Request
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Type */}
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Who are we praying for?</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 bg-slate-50/50 focus:bg-white transition-all"
                    placeholder="Friend, family member, or name..."
                    value={onBehalfOf}
                    onChange={(e) => setOnBehalfOf(e.target.value)}
                  />
                </div>
              )}

              {/* Name & Anonymity */}
              <div className="space-y-3">
                {!user ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Your Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 bg-slate-50/50 focus:bg-white transition-all"
                      placeholder="Your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 px-1 italic">Leave blank to stay anonymous</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1 group cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
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
                )}
              </div>

              {/* Visibility Choice */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Post Privacy</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all",
                      visibility === 'public' ? "border-maroon/20 bg-maroon/5 ring-1 ring-maroon/5" : "border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", visibility === 'public' ? "bg-maroon text-white" : "bg-slate-100 text-slate-400")}>
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">Community Wall</span>
                    </div>
                    {visibility === 'public' && <CheckCircle2 className="h-4 w-4 text-maroon" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all",
                      visibility === 'private' ? "border-slate-900/10 bg-slate-900/5 ring-1 ring-slate-900/5" : "border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", visibility === 'private' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">Private (Leaders)</span>
                    </div>
                    {visibility === 'private' && <CheckCircle2 className="h-4 w-4 text-slate-900" />}
                  </button>
                </div>
              </div>

              {/* Prayer Request */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Your Prayer</label>
                <textarea
                  className="w-full px-4 py-4 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 outline-none transition-all min-h-[140px] text-sm bg-slate-50/50 focus:bg-white resize-none"
                  placeholder="How can we stand in faith with you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* Sensitivity Note */}
              {(visibility === 'private' || user) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Leadership Note (Optional)</label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-100 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 outline-none transition-all min-h-[80px] text-sm bg-slate-50/50 focus:bg-white resize-none"
                    placeholder="Any extra details for the pastors?"
                    value={sensitivityNote}
                    onChange={(e) => setSensitivityNote(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full py-4 bg-maroon text-white rounded-2xl font-bold text-sm hover:bg-maroon-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-maroon/10"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {visibility === 'private' ? 'Send Privately' : 'Post Request'}
              </button>

              <div className="px-2">
                <p className="text-[10px] text-slate-400 leading-relaxed italic flex items-start gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-maroon shrink-0" />
                  Every request is handled with grace. Public posts are moderated for the safety of our church family.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Requests List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-maroon">
              <Clock className="h-5 w-5 text-slate-300" />
            </div>
            <input
              type="text"
              placeholder="Search by keyword, name, or message..."
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-4 focus:ring-maroon/5 focus:border-maroon/20 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-maroon opacity-20" />
              <p className="text-slate-400 font-light animate-pulse">Lifting up requests...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {(activeTab === 'wall' ? requests : myRequests)
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
                      />
                      <AnimatePresence>
                        {activeCommentId === request.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-slate-50/50 rounded-b-[2rem] px-8 pb-8 -mt-10 pt-10 border-x border-b border-slate-100 mx-4">
                              <CommentSection requestId={request.id} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </AnimatePresence>

              {(activeTab === 'wall' ? requests : myRequests).length === 0 && (
                <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-display text-slate-900 mb-3 tracking-tight">Inner Sanctuary</h3>
                  <p className="text-slate-500 font-light max-w-md mx-auto">No prayer requests visible at the moment. Be the first to share a burden or a blessing.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
