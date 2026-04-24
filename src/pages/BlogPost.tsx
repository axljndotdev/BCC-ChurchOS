import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { getBlogPost, getBlogComments, addBlogComment } from '../services/db';
import { BlogPost as IBlogPost, BlogComment } from '../types';
import { formatDate } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import Markdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

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
      // Refresh
      const data = await getBlogComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-20 pt-20 border-t border-slate-100 space-y-12">
      <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-maroon" />
        Join the Conversation
      </h2>
      
      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-6 bg-slate-50 rounded-3xl">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-maroon font-bold shadow-sm">
                  {comment.userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-900">{comment.userName}</span>
                    <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">"{comment.content}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            className="w-full p-6 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all min-h-[150px] text-slate-600"
            placeholder="Share your reflection or a word of encouragement..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute bottom-6 right-6 px-10 py-4 bg-maroon text-white rounded-2xl font-bold shadow-lg hover:bg-maroon-dark transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Post Comment <Send className="h-4 w-4" /></>}
          </button>
        </form>
      ) : (
        <div className="p-12 bg-slate-50 rounded-[2rem] text-center border-2 border-dashed border-slate-100">
          <p className="text-slate-500 mb-6">Want to join the discussion?</p>
          <Link to="/login" className="px-10 py-4 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-all inline-block">
            Log In to Reflect
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<IBlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const data = await getBlogPost(slug);
        setPost(data);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">Post not found</h2>
          <p className="text-slate-500 mb-8">The story you're looking for might have been moved or deleted.</p>
          <Link to="/blogs" className="px-8 py-3 bg-maroon text-white rounded-full font-bold hover:bg-maroon-dark transition-all">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <header className="relative w-full h-[60vh] overflow-hidden">
        <img 
          src={post.coverImage || `https://picsum.photos/seed/${post.id}/1920/1080`}
          alt={post.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Link to="/blogs" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
              </Link>
              <div className="flex items-center gap-4">
                <span className="px-4 py-1 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {post.category || 'Ministry Reflections'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white ring-2 ring-white/10">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold leading-none">by: {post.authorName}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/60">Author</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Body */}
          <div className="flex-1 prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-maroon prose-maroon">
            <div className="markdown-body">
              <Markdown>{post.content}</Markdown>
            </div>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-16 flex flex-wrap gap-2 pt-8 border-t border-slate-100">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Share Sidebar */}
          <aside className="lg:w-16 space-y-4">
            <div className="sticky top-32 flex lg:flex-col items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest lg:rotate-180 lg:[writing-mode:vertical-lr] mb-2">
                Share This
              </span>
              <button className="h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-maroon hover:border-maroon/20 hover:bg-maroon/5 transition-all">
                <Facebook className="h-5 w-5" />
              </button>
              <button className="h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-maroon hover:border-maroon/20 hover:bg-maroon/5 transition-all">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-maroon hover:border-maroon/20 hover:bg-maroon/5 transition-all">
                <LinkIcon className="h-5 w-5" />
              </button>
            </div>
          </aside>
        </div>

        <BlogComments postId={post.id} />
      </article>

      {/* Newsletter / CTA */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Stay Connected</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Get more reflections and church updates delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
            />
            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
