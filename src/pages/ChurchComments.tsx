import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getChurchComments, 
  addChurchComment, 
  toggleLikeChurchComment, 
  deleteChurchComment 
} from '../services/db';
import { ChurchComment, ChurchCommentCategory } from '../types';
import { 
  MessageSquare, Heart, Send, CheckCircle2, Shield, 
  Sparkles, Filter, Search, User, Trash2, Quote, 
  HelpCircle, ThumbsUp, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES: { label: string; value: ChurchCommentCategory }[] = [
  { label: 'General', value: 'General' },
  { label: 'Encouragement', value: 'Encouragement' },
  { label: 'Testimony', value: 'Testimony' },
  { label: 'Sunday Service', value: 'Sunday Service' },
  { label: 'Feedback', value: 'Feedback' },
  { label: 'Prayer & Praise', value: 'Prayer & Praise' },
];

export default function ChurchComments() {
  const { user, profile, isAdmin, isCouncil, isSuperAdmin } = useAuth();

  const [comments, setComments] = useState<ChurchComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ChurchCommentCategory>('General');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Track liked comments locally in session/localStorage
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('bcc_liked_comments');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const canModerate = Boolean(isSuperAdmin || isAdmin || isCouncil);

  // Prefill name if signed in
  useEffect(() => {
    if (user && profile?.displayName && !isAnonymous && !authorName) {
      setAuthorName(profile.displayName);
    }
  }, [user, profile, isAnonymous]);

  // Load comments
  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getChurchComments();
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Please type a comment or message.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      let displayNameToUse = authorName.trim();
      if (isAnonymous) {
        displayNameToUse = displayNameToUse ? `${displayNameToUse}` : 'Anonymous';
      } else if (!displayNameToUse) {
        displayNameToUse = profile?.displayName || 'Church Friend';
      }

      const userRole = isAnonymous 
        ? undefined 
        : (profile?.title && profile.title !== 'Member' ? profile.title : (profile?.role?.[0] ? String(profile.role[0]).replace('_', ' ') : undefined));

      const created = await addChurchComment({
        authorName: displayNameToUse,
        isAnonymous,
        content: content.trim(),
        category,
        userId: isAnonymous ? undefined : user?.uid,
        userRole
      });

      setComments(prev => [created, ...prev]);
      setContent('');
      if (!user) setAuthorName('');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    } catch (err) {
      console.error('Error posting comment:', err);
      setErrorMessage('Could not post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    const userIdentifier = user?.uid || (localStorage.getItem('bcc_visitor_id') || `anon_${Math.random().toString(36).substring(2, 9)}`);
    if (!localStorage.getItem('bcc_visitor_id')) {
      localStorage.setItem('bcc_visitor_id', userIdentifier);
    }

    const { likes, isLiked } = await toggleLikeChurchComment(commentId, userIdentifier);

    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, likes };
      }
      return c;
    }));

    setLikedIds(prev => {
      const next = isLiked ? [...prev, commentId] : prev.filter(id => id !== commentId);
      localStorage.setItem('bcc_liked_comments', JSON.stringify(next));
      return next;
    });
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to remove this comment?')) return;
    try {
      const ok = await deleteChurchComment(commentId);
      if (ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // Filtered comments
  const filteredComments = comments.filter(c => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 bg-[#FAF7F2] min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#1A0B0E] via-[#2D060D] to-[#1A0B0E] py-14 sm:py-20 text-center text-white relative overflow-hidden border-b border-[#C99738]/30">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A121D] to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 shadow-2xl">
            <span className="text-[#E5B869] font-display">✦</span>
            <span>Community Voices & Feedback</span>
            <span className="text-[#E5B869] font-display">✦</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight leading-tight"
          >
            Church Comments
          </motion.h1>

          <p className="text-sm sm:text-base md:text-lg text-stone-200 font-light max-w-2xl mx-auto leading-relaxed">
            A welcoming space for everyone—church members, visitors, and friends—to leave words of encouragement, reflections, service feedback, or testimonies.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* Comment Submission Card */}
        <div className="bg-[#FDFBF7] rounded-3xl p-5 sm:p-8 shadow-xl border border-[#E8D5B5] mb-10">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E8D5B5]/60">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-[#7A121D] text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="h-5 w-5 text-[#E5B869]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-[#5C0612]">
                  Leave a Comment
                </h2>
                <p className="text-xs text-stone-500">
                  Share openly or post anonymously. All respectful voices are welcome.
                </p>
              </div>
            </div>

            {user && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EE] text-[#7A121D] rounded-full text-[11px] font-bold border border-[#C99738]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Signed in as {profile?.displayName?.split(' ')[0] || 'Member'}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Author Name & Anonymous Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Your Name (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    disabled={isAnonymous}
                    placeholder={isAnonymous ? "Posting as Anonymous" : (user ? (profile?.displayName || "Your Name") : "e.g. Sister Maria or leave empty")}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none",
                      isAnonymous 
                        ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed" 
                        : "bg-white border-[#E8D5B5] focus:border-[#7A121D] focus:ring-2 focus:ring-[#7A121D]/15 text-stone-900"
                    )}
                    maxLength={80}
                  />
                  <User className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-400" />
                </div>
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Comment Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ChurchCommentCategory)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8D5B5] bg-white text-stone-900 text-sm focus:outline-none focus:border-[#7A121D] focus:ring-2 focus:ring-[#7A121D]/15"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Anonymous Checkbox Toggle */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6EE] border border-[#E8D5B5]/60">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-[#C99738] text-[#7A121D] focus:ring-[#7A121D] cursor-pointer"
              />
              <label htmlFor="isAnonymous" className="text-xs font-semibold text-stone-700 cursor-pointer select-none flex-1">
                Post anonymously <span className="font-normal text-stone-500">(Your name and identity will not be displayed)</span>
              </label>
            </div>

            {/* Comment Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Your Comment / Message
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  {content.length}/3000
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, words of gratitude, service reflections, or constructive feedback for our community..."
                rows={4}
                maxLength={3000}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8D5B5] bg-white text-stone-900 text-sm focus:outline-none focus:border-[#7A121D] focus:ring-2 focus:ring-[#7A121D]/15 leading-relaxed placeholder:text-stone-400"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your comment has been posted to our church wall.</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "px-6 py-3.5 rounded-full bg-[#7A121D] text-white text-xs font-bold uppercase tracking-widest border border-[#C99738]/80 shadow-md flex items-center gap-2 hover:bg-[#5C0612] active:scale-95 transition-all min-h-[44px]",
                  submitting && "opacity-75 cursor-not-allowed"
                )}
              >
                {submitting ? (
                  <span>Posting...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-[#E5B869]" />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filter and Search Controls */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search comments by keyword, author, or topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8D5B5] bg-white text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#7A121D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Count indicator */}
            <span className="text-xs text-stone-500 font-semibold self-center shrink-0">
              Showing {filteredComments.length} {filteredComments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] shrink-0 transition-all border min-h-[32px]",
                selectedCategory === 'all'
                  ? "bg-[#7A121D] text-white border-[#C99738]"
                  : "bg-white text-stone-600 border-[#E8D5B5] hover:bg-[#FAF6EE]"
              )}
            >
              All Topics
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] shrink-0 transition-all border min-h-[32px]",
                  selectedCategory === cat.value
                    ? "bg-[#7A121D] text-white border-[#C99738]"
                    : "bg-white text-stone-600 border-[#E8D5B5] hover:bg-[#FAF6EE]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comments Feed */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E8D5B5] shadow-xs">
            <MessageCircle className="h-12 w-12 text-[#C99738]/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800 mb-1">
              {searchQuery || selectedCategory !== 'all' ? 'No comments match your search' : 'No comments yet'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? "No comments match your search or filter criteria. Try clearing filters."
                : "Be the first to share an encouraging word or comment with our church family!"}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-[#FAF6EE] text-[#7A121D] text-xs font-bold rounded-full hover:bg-stone-200 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredComments.map((comment) => {
                const isLiked = likedIds.includes(comment.id);
                const canDelete = canModerate || (user && comment.userId === user.uid);

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8D5B5]/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border",
                          comment.isAnonymous 
                            ? "bg-stone-100 text-stone-500 border-stone-200" 
                            : "bg-[#FAF6EE] text-[#7A121D] border-[#C99738]/40"
                        )}>
                          {comment.isAnonymous ? '?' : comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-stone-900 leading-tight">
                              {comment.authorName}
                            </span>
                            {comment.isAnonymous ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold border border-stone-200">
                                <Shield className="h-2.5 w-2.5" /> Anonymous
                              </span>
                            ) : comment.userRole ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#7A121D] text-[10px] font-bold border border-[#C99738]/30">
                                {comment.userRole}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] text-stone-400 block mt-0.5">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      {comment.category && (
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#9A6F1D] text-[10px] font-bold uppercase tracking-wider border border-[#C99738]/30 shrink-0">
                          {comment.category}
                        </span>
                      )}
                    </div>

                    {/* Content body */}
                    <p className="text-sm text-stone-800 leading-relaxed font-normal whitespace-pre-line mb-4 pl-1">
                      {comment.content}
                    </p>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E8D5B5]/40 text-xs">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all min-h-[36px]",
                          isLiked 
                            ? "bg-red-50 text-red-600 font-bold border border-red-200" 
                            : "bg-[#FAF6EE] text-stone-600 hover:text-[#7A121D] hover:bg-[#F5EDDC] border border-[#E8D5B5]/60"
                        )}
                        aria-label="Encourage / Like this comment"
                      >
                        <Heart className={cn("h-4 w-4", isLiked && "fill-current text-red-600")} />
                        <span>{comment.likes || 0}</span>
                        <span className="text-[10px] uppercase font-semibold ml-0.5 hidden xs:inline">
                          {isLiked ? 'Encouraged' : 'Encourage'}
                        </span>
                      </button>

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-stone-400 hover:text-red-600 p-2 rounded-lg transition-colors flex items-center gap-1 min-h-[36px]"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
