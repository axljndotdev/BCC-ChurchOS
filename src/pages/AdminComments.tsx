import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  Search, 
  Filter, 
  Loader2, 
  Heart, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { 
  getChurchComments, 
  deleteChurchComment
} from '../services/db';
import { ChurchComment } from '../types';
import { formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'All',
  'General',
  'Testimony',
  'Encouragement',
  'Sunday Service',
  'Feedback',
  'Prayer & Praise'
] as const;

export default function AdminComments() {
  const [comments, setComments] = useState<ChurchComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<ChurchComment | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [selectedCategory]);

  const fetchComments = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getChurchComments();
      setComments(data);
    } catch (error) {
      console.error('Error fetching church comments:', error);
      setErrorMessage('Failed to load community comments.');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async (comment: ChurchComment) => {
    setProcessingId(comment.id);
    setErrorMessage(null);
    try {
      const success = await deleteChurchComment(comment.id);
      if (success) {
        setComments(prev => prev.filter(c => c.id !== comment.id));
        setCommentToDelete(null);
        setSuccessMessage('Comment deleted from Community Wall.');
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage('Failed to delete comment. Please check admin permissions.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setErrorMessage('Failed to delete comment.');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter comments by selected category and search query
  const filteredComments = comments.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      c.content.toLowerCase().includes(q) ||
      c.authorName.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.userRole && c.userRole.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  // Calculate high-level stats
  const totalComments = comments.length;
  const testimoniesCount = comments.filter(c => c.category === 'Testimony').length;
  const praiseCount = comments.filter(c => c.category === 'Prayer & Praise').length;
  const feedbackCount = comments.filter(c => c.category === 'Feedback').length;

  return (
    <div className="space-y-8 relative">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-emerald-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 bg-rose-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-rose-700 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 text-rose-300" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 text-rose-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/70 border border-amber-300/60 rounded-full text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-3">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span>Community Wall Moderation</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Comments & Community Feed</h1>
          <p className="text-slate-500 font-light mt-1">
            Moderate member posts, testimonies, service feedback, and encouragement messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/comments"
            target="_blank"
            className="px-4 py-2.5 bg-white border border-[#E8D5B5] text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:text-maroon hover:border-maroon transition-all flex items-center gap-2 shadow-xs min-h-[42px]"
          >
            <span>View Public Wall</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Comments</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900">{totalComments}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100/60 shadow-xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Testimonies</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-amber-900">{testimoniesCount}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100/60 shadow-xs">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Prayer & Praise</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-900">{praiseCount}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100/60 shadow-xs">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Feedback</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-blue-900">{feedbackCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  selectedCategory === cat
                    ? "bg-[#7A121D] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-maroon focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-maroon animate-spin" />
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No comments found in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 hover:border-[#E8D5B5] transition-all flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs"
            >
              <div className="space-y-3 flex-1">
                {/* Author Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#FAF6EE] border border-[#C99738]/40 flex items-center justify-center font-bold text-xs text-[#7A121D] shrink-0">
                    {comment.isAnonymous ? '?' : (comment.authorName || 'M').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {comment.isAnonymous ? 'Anonymous Member' : comment.authorName}
                  </span>

                  {comment.userRole && !comment.isAnonymous && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      {comment.userRole}
                    </span>
                  )}

                  {comment.category && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {comment.category}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 ml-auto sm:ml-0">
                    <Calendar className="h-3 w-3" />
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {/* Comment Content */}
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap pl-10 sm:pl-0 font-light">
                  {comment.content}
                </p>

                {/* Footer details */}
                <div className="flex items-center gap-4 text-xs text-slate-400 pl-10 sm:pl-0">
                  <span className="flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                    <Heart className="h-3.5 w-3.5 fill-rose-500" />
                    {comment.likes || 0} Likes
                  </span>
                  {comment.userId && (
                    <span className="text-[10px] text-slate-400">User ID: {comment.userId.substring(0, 8)}...</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setCommentToDelete(comment)}
                  disabled={processingId === comment.id}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Delete Comment"
                  aria-label="Delete comment"
                >
                  {processingId === comment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 font-display">Delete Comment?</h3>
                <p className="text-xs text-slate-500">This comment will be permanently removed from the Community Wall.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">
                Author: <span className="font-bold text-slate-900">{commentToDelete.isAnonymous ? 'Anonymous' : commentToDelete.authorName}</span>
              </p>
              <p className="text-xs text-slate-600 italic line-clamp-3">
                "{commentToDelete.content}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setCommentToDelete(null)}
                disabled={processingId === commentToDelete.id}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDelete(commentToDelete)}
                disabled={processingId === commentToDelete.id}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {processingId === commentToDelete.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
