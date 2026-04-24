import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSermon, getSermonComments, addSermonComment } from '../services/db';
import { Sermon, SermonComment } from '../types';
import { Calendar, User, ArrowLeft, MessageSquare, Send, BookOpen, Clock, Loader2 } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SermonDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [comments, setComments] = useState<SermonComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [sermonData, commentData] = await Promise.all([
          getSermon(id),
          getSermonComments(id)
        ]);
        setSermon(sermonData);
        setComments(commentData);
      } catch (error) {
        console.error('Error fetching sermon details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !profile || !id) return;

    try {
      setSubmittingComment(true);
      await addSermonComment(id, {
        userId: user.uid,
        userName: profile.displayName,
        message: newComment
      });
      setNewComment('');
      // Refresh comments
      const data = await getSermonComments(id);
      setComments(data);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!sermon) return <div className="min-h-screen flex items-center justify-center text-center p-4">
    <div>
      <h2 className="text-2xl font-bold mb-4">Sermon not found</h2>
      <Link to="/sermons" className="text-maroon font-bold flex items-center justify-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to archive
      </Link>
    </div>
  </div>;

  return (
    <div className="pb-20">
      {/* Video Hero */}
      <section className="bg-slate-900 pt-20 pb-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <Link to="/sermons" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Archive
          </Link>
          
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black ring-1 ring-white/10 flex items-center justify-center">
             {sermon.videoUrl ? (
               <iframe 
                src={getEmbedUrl(sermon.videoUrl)}
                className="w-full h-full"
                title={sermon.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
             ) : (
               <div className="flex flex-col items-center gap-3">
                 <Loader2 className="h-8 w-8 text-slate-800 animate-spin" />
                 <p className="text-slate-400 font-light italic">Preparing video stream...</p>
               </div>
             )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-maroon/5 text-maroon text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Latest Message
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2">
                  <BookOpen className="h-3 w-3" /> {sermon.scripture}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
                {sermon.title}
              </h1>
              <div className="flex items-center gap-6 pb-8 mb-8 border-b border-slate-50">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-maroon font-bold text-lg">
                  {sermon.speaker.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{sermon.speaker}</p>
                  <p className="text-xs text-slate-400">{formatDate(sermon.date)}</p>
                </div>
              </div>
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Message Notes</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-light">
                  {sermon.notes}
                </p>
              </div>
            </div>

            {/* Interactions */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-8 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-maroon" />
                Discussion & Reflection
              </h2>
              
              <div className="space-y-6 mb-8">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {comment.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{comment.userName}</span>
                          <span className="text-[10px] text-slate-400 tracking-wider">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-600 italic">"{comment.message}"</p>
                      </div>
                    </div>
                  ))}
              </div>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="relative">
                  <textarea
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all min-h-[120px] text-sm bg-slate-50"
                    placeholder="What did you learn from this message? Leave an encouragement..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingComment}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="absolute bottom-4 right-4 p-3 bg-maroon text-white rounded-xl shadow-lg hover:bg-maroon-dark transition-all disabled:opacity-50"
                  >
                    {submittingComment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </form>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl text-center">
                  <p className="text-slate-500 text-sm">
                    Please <Link to="/login" className="text-maroon font-bold">log in</Link> to join the discussion.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 h-32 w-32 bg-maroon rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold mb-4">Prayer Wall</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Inspired by the message? Share a prayer request or pray for others.
                </p>
                <Link 
                  to="/member/prayer" 
                  className="inline-flex items-center gap-2 text-maroon font-bold bg-white px-6 py-3 rounded-xl hover:bg-slate-100 transition-all text-sm"
                >
                  Go to Prayer Wall <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
}
