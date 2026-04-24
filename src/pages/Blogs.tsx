import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/db';
import { BlogPost } from '../types';
import { formatDate } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBlogPosts('published', 20);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1920" 
            alt="Blog Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-display text-white mb-6 tracking-tight">The <span className="italic font-light">Word</span> Blog</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
              Reflections, study notes, and updates from our church leadership and community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 flex flex-col h-full"
            >
              <Link to={`/blogs/${post.slug || post.id}`} className="block relative h-64 overflow-hidden">
                <img 
                  src={post.coverImage || `https://picsum.photos/seed/${post.id}/800/600`}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                {post.category && (
                  <span className="absolute top-6 left-6 px-4 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {post.category}
                  </span>
                )}
              </Link>
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    by: {post.authorName}
                  </span>
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-4 group-hover:text-maroon transition-colors leading-tight">
                  <Link to={`/blogs/${post.slug || post.id}`}>{post.title}</Link>
                </h2>
                <p className="text-slate-500 font-light line-clamp-3 mb-8 flex-1">
                  {post.excerpt}
                </p>
                <Link 
                  to={`/blogs/${post.slug || post.id}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-maroon hover:text-maroon-dark transition-colors group/btn"
                >
                  Read Story
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
