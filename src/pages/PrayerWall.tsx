import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPrayerRequests, addPrayerRequest, prayForRequest, addPrayerComment, getPrayerComments } from '../services/db';
import { PrayerRequest, PrayerComment } from '../types';
import { MessageSquare, Send, CheckCircle2, Clock, Heart, Loader2, ShieldCheck, Globe } from 'lucide-react';
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
    <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
          </div>
        ) : comments.map((comment) => (
          <div key={comment.id} className="text-sm bg-slate-50 p-3 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-900">{comment.userName}</span>
              <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-slate-600 italic">"{comment.message}"</p>
          </div>
        ))}
      </div>
      
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
            placeholder="Type a word of encouragement..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="p-2 bg-maroon text-white rounded-lg hover:bg-maroon-dark transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  );
}

export default function PrayerWall() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'myself' | 'others'>('myself');
  const [onBehalfOf, setOnBehalfOf] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [sensitivityNote, setSensitivityNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await getPrayerRequests('approved');
      setRequests(data);
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
    if (!message.trim() || !user || !profile) return;

    try {
      setSubmitting(true);
      
      await addPrayerRequest({
        userId: user.uid,
        userName: profile.displayName,
        onBehalfOf: targetType === 'others' ? onBehalfOf : undefined,
        message,
        isAnonymous,
        visibility,
        sensitivityNote: sensitivityNote || undefined
      });

      setMessage('');
      setOnBehalfOf('');
      setSensitivityNote('');
      
      alert(visibility === 'private' 
        ? 'Your prayer request has been sent privately to our leadership. Thank you for sharing.' 
        : 'Prayer request submitted for approval.');
      
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
      // Optimistic update
      setRequests(prev => prev.map(r => 
        r.id === requestId 
          ? { 
              ...r, 
              prayCount: (r.prayCount || 0) + 1, 
              prayers: [...(r.prayers || []), user.uid] 
            } 
          : r
      ));
    } catch (error) {
      console.error('Error praying for request:', error);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900">Prayer Wall</h1>
        <p className="text-slate-600">Share your requests and pray for others in our community.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Request */}
        <div className="lg:col-span-1">
          {!user ? (
            <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300 text-center sticky top-24">
              <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-display font-bold text-slate-900 mb-2">Member Access Only</h3>
              <p className="text-sm text-slate-500 mb-6">Please log in to your account to share prayer requests or view the prayer wall.</p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-maroon font-bold text-sm hover:underline"
              >
                Go to login
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-maroon" />
                Submit a Request
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Target Type */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">I am praying for...</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('myself')}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                        targetType === 'myself' ? "bg-maroon text-white border-maroon shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      Myself
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('others')}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                        targetType === 'others' ? "bg-maroon text-white border-maroon shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      A Friend / Family
                    </button>
                  </div>
                </div>

                {targetType === 'others' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Their Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon bg-slate-50/50"
                      placeholder="Who are we praying for?"
                      value={onBehalfOf}
                      onChange={(e) => setOnBehalfOf(e.target.value)}
                    />
                  </div>
                )}

                {/* Name & Anonymity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Identity</label>
                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 cursor-pointer uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        checked={isAnonymous} 
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-slate-300 text-maroon focus:ring-maroon"
                      />
                      Post Anonymously
                    </label>
                  </div>
                  {!isAnonymous && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm font-medium text-slate-600">{profile?.displayName}</p>
                    </div>
                  )}
                </div>

                {/* Visibility Choice */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visibility</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisibility('public')}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                        visibility === 'public' 
                          ? "border-maroon bg-maroon/5 shadow-sm" 
                          : "border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        visibility === 'public' ? "bg-maroon text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Public (Prayer Wall)</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">Visible to BCC members for encouragement</p>
                      </div>
                      {visibility === 'public' && <CheckCircle2 className="h-5 w-5 text-maroon" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility('private')}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                        visibility === 'private' 
                          ? "border-maroon bg-maroon/5 shadow-sm" 
                          : "border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        visibility === 'private' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Private (Leadership Only)</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tight">Only Pastors & Elders will receive this</p>
                      </div>
                      {visibility === 'private' && <CheckCircle2 className="h-5 w-5 text-maroon" />}
                    </button>
                  </div>
                </div>

                {/* Prayer Request */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prayer Request</label>
                  <textarea
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all min-h-[120px] text-sm bg-slate-50/50"
                    placeholder="How can we pray for you (or them) today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Sensitivity Note */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sensitivity Note (Optional)</label>
                  <textarea
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all min-h-[80px] text-sm bg-slate-50/50"
                    placeholder="Any specific instructions for leadership? (e.g., 'Please keep this quiet' or 'Share with council')"
                    value={sensitivityNote}
                    onChange={(e) => setSensitivityNote(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 leading-relaxed italic flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-maroon shrink-0" />
                    Your prayers are safely handled by leadership. Only approved public requests will appear on the wall.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="w-full py-4 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-maroon/20"
                >
                  {submitting ? 'Submitting...' : visibility === 'private' ? 'Send Privately' : 'Post Request'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Requests List */}
        <div className="lg:col-span-2 space-y-6">
          {!user ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
              <ShieldCheck className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Member Space</h2>
              <p className="text-slate-500 font-light max-w-md mx-auto">
                The Prayer Wall is a protected space for BCC members. Please log in to see requests and join us in prayer.
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-maroon" />
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request, i) => {
                const hasPrayed = user && request.prayers?.includes(user.uid);
                const showName = request.isAnonymous ? 'Anonymous Member' : request.userName;
                return (
                  <motion.div 
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                          request.onBehalfOf ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-maroon"
                        )}>
                          {request.onBehalfOf ? request.onBehalfOf.charAt(0) : showName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex flex-col">
                            <h3 className="font-bold text-slate-900">
                              {request.onBehalfOf ? `Prayer for ${request.onBehalfOf}` : 'Prayer Request'}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              Posted by {showName}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(request.date)}</p>
                        </div>
                      </div>
                      {request.status === 'answered' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Answered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" /> Praying
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-6 italic font-light">
                      "{request.message}"
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => handlePray(request.id)}
                        disabled={!user || hasPrayed}
                        className={cn(
                          "flex items-center gap-2 text-sm font-medium transition-colors",
                          hasPrayed ? "text-red-500" : "text-slate-500 hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", hasPrayed && "fill-current")} /> 
                        {hasPrayed ? 'Praying' : "I'm praying"} 
                        {(request.prayCount || 0) > 0 && <span>({request.prayCount})</span>}
                      </button>
                      <button 
                        onClick={() => setActiveCommentId(activeCommentId === request.id ? null : request.id)}
                        className={cn(
                          "flex items-center gap-2 text-sm font-medium transition-colors",
                          activeCommentId === request.id ? "text-maroon" : "text-slate-500 hover:text-maroon"
                        )}
                      >
                        <MessageSquare className="h-4 w-4" /> 
                        Leave a word
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeCommentId === request.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <CommentSection requestId={request.id} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
