import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Link as LinkIcon, MessageSquare, Send, Loader2, BookOpen, Check } from 'lucide-react';
import { getBlogPost, getBlogComments, addBlogComment, getBlogPosts } from '../services/db';
import { BlogPost as IBlogPost, BlogComment } from '../types';
import { formatDate } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import Markdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

function BlogComments({ postId }: { postId: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getBlogComments(postId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching blog comments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !profile) return;

    try {
      setSubmitting(true);
      await addBlogComment(postId, {
        userId: user.uid,
        userName: profile.displayName,
        content: newComment
      });
      setNewComment('');
      const data = await getBlogComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-[#E8D5B5]/80 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A121D]">Discussion</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
            <span>Community Reflections</span>
            <span className="text-sm font-sans font-normal text-slate-500">({comments.length})</span>
          </h2>
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#7A121D]" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4 bg-white/60 p-4 rounded-2xl border border-[#E8D5B5]/60 text-center">
            No reflections yet. Be the first to share your thoughts or encouragement!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-[#E8D5B5] shadow-xs">
                <div className="h-10 w-10 rounded-full bg-[#7A121D] text-[#E5B869] flex items-center justify-center font-bold text-sm shrink-0 border border-[#C99738]/40">
                  {comment.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-bold text-sm text-slate-900">{comment.userName}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-[#E8D5B5] shadow-sm space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Leave a Reflection
          </label>
          <textarea
            className="w-full p-4 bg-[#FDFBF7] border border-[#E8D5B5] rounded-2xl outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] transition-all min-h-[110px] text-sm text-slate-800 placeholder:text-slate-400"
            placeholder="Share a verse, note of encouragement, or reflection on this post..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-6 py-2.5 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#5C0612] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Share Reflection <Send className="h-3.5 w-3.5 text-[#E5B869]" /></>}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 bg-white rounded-3xl text-center border border-[#E8D5B5]">
          <p className="text-slate-600 text-sm mb-4">Want to participate in the conversation?</p>
          <Link to="/login" className="px-6 py-2.5 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#5C0612] transition-all inline-block shadow-md">
            Sign In to Reflect
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<IBlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const [data, allPosts] = await Promise.all([
          getBlogPost(slug),
          getBlogPosts('published', 4)
        ]);
        setPost(data);
        if (data) {
          setRelatedPosts(allPosts.filter(p => p.id !== data.id).slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#FAF7F2]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#FAF7F2]">
        <div className="text-center max-w-md">
          <BookOpen className="w-12 h-12 text-[#7A121D] mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Article Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">The pastoral reflection or article you requested could not be located.</p>
          <Link to="/blogs" className="px-6 py-3 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#5C0612] transition-all">
            Return to Articles
          </Link>
        </div>
      </div>
    );
  }

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = `Read "${post.title}" from Bethesda Community Church`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 sm:pb-32">
      {/* Editorial Header (Matching 📑 Blog Post.png) */}
      <header className="pt-10 sm:pt-16 pb-8 sm:pb-12 border-b border-[#E8D5B5]/60 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-[#7A121D] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blogs" className="hover:text-[#7A121D] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-[#7A121D] font-bold uppercase tracking-wider">{post.category || 'Article'}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[#1A0B0E] leading-[1.12] tracking-tight mb-6">
              {post.title}
            </h1>

            {/* Author bar with unboxed metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#E8D5B5]/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#7A121D] text-[#E5B869] font-display font-bold flex items-center justify-center text-base border border-[#C99738]/40">
                  {post.authorName?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{post.authorName}</p>
                  <p className="text-xs text-slate-500">Bethesda Ministry Contributor</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C99738]" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C99738]" />
                  4 min read
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Cover Image Frame */}
        {post.coverImage && (
          <div className="rounded-3xl overflow-hidden border border-[#E8D5B5] shadow-lg mb-10 sm:mb-14 aspect-[16/10] sm:aspect-[16/9] bg-stone-100">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10 sm:gap-14">
          {/* Main Article Body */}
          <div className="flex-1 min-w-0 bg-white p-6 sm:p-10 lg:p-12 rounded-3xl border border-[#E8D5B5] shadow-sm">
            <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg prose-p:mb-6 prose-strong:text-[#7A121D] prose-blockquote:border-l-4 prose-blockquote:border-[#C99738] prose-blockquote:bg-[#FAF6EE] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-slate-800">
              <Markdown>{post.content}</Markdown>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-[#E8D5B5]/60 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs text-slate-500 bg-[#FAF6EE] border border-[#E8D5B5] px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Profile Box */}
            <div className="mt-12 p-6 sm:p-8 bg-[#FAF6EE] rounded-2xl border border-[#E8D5B5] flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#7A121D] text-[#E5B869] font-display font-bold flex items-center justify-center text-xl shrink-0 border border-[#C99738]/40">
                {post.authorName?.charAt(0) || 'B'}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A121D]">About the Author</span>
                <h4 className="text-base font-bold text-slate-900">{post.authorName}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Serving in the Bethesda Community Church fellowship in Kabankalan City. Dedicated to sharing God's truth, love, and community hope.
                </p>
              </div>
            </div>

            {/* Share Affordances */}
            <div className="mt-8 pt-6 border-t border-[#E8D5B5]/60 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Share This Reflection</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={shareOnFacebook}
                  className="p-2.5 rounded-full bg-[#FAF6EE] hover:bg-[#7A121D] text-slate-700 hover:text-white border border-[#E8D5B5] transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="p-2.5 rounded-full bg-[#FAF6EE] hover:bg-[#7A121D] text-slate-700 hover:text-white border border-[#E8D5B5] transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2.5 rounded-full bg-[#FAF6EE] hover:bg-[#7A121D] text-slate-700 hover:text-white border border-[#E8D5B5] transition-colors flex items-center gap-1"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Comments Thread */}
            <BlogComments postId={post.id} />
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E8D5B5]/80">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A121D]">More Articles</span>
                <h3 className="text-2xl font-display font-bold text-slate-900">Continue Reading</h3>
              </div>
              <Link to="/blogs" className="text-xs font-bold uppercase tracking-wider text-[#7A121D] hover:underline">
                All Articles &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(related => (
                <Link
                  key={related.id}
                  to={`/blogs/${related.slug || related.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8D5B5] p-4 group hover:shadow-lg transition-all"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-stone-100">
                    <img
                      src={related.coverImage || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=600'}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#7A121D] uppercase tracking-wider">{related.category || 'Article'}</span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#7A121D] transition-colors line-clamp-2 mt-1">
                    {related.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
