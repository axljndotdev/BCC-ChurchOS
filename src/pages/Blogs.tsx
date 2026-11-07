import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, Clock, Search, ArrowRight, Tag, BookOpen, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/db';
import { BlogPost } from '../types';
import { formatDate } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

const CATEGORIES = [
  'All',
  'Faith & Discipleship',
  'Family & Life',
  'Pastoral Notes',
  'Church Life',
  'Youth & Kids'
];

export default function Blogs() {
  const { pageData } = useCMS('blogs');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBlogPosts('published', 30);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || 
        (post.category && post.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (selectedCategory === 'Pastoral Notes' && post.authorName?.toLowerCase().includes('pastor'));
      
      const matchesSearch = !searchQuery.trim() || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.authorName && post.authorName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Featured post is the first post when no filter is applied
  const featuredPost = (selectedCategory === 'All' && !searchQuery.trim() && filteredPosts.length > 0) 
    ? filteredPosts[0] 
    : null;

  const regularPosts = featuredPost 
    ? filteredPosts.slice(1) 
    : filteredPosts;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#FAF7F2]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const heroImage = pageData?.hero?.imageUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1920";

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 sm:pb-32 relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="blogs" pageName="Blog & Reflections" />

      {/* Hero Header - Matching Blog V3 */}
      {pageData?.hero?.visible !== false && (
        <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] border-b border-[#C99738]/30">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img 
              src={heroImage} 
              alt="Blog Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-2xl">
                <span className="text-[#E5B869] font-display">✦</span>
                <span>{pageData?.hero?.badge || 'Spiritual Reflections & Church News'}</span>
                <span className="text-[#E5B869] font-display">✦</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
                {pageData?.hero?.title || 'The Word & Church Life'}
              </h1>

              {pageData?.hero?.subtitle && (
                <p className="text-base sm:text-xl text-[#E5B869] font-display italic mb-3">
                  {pageData.hero.subtitle}
                </p>
              )}

              <p className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed mb-8">
                {pageData?.hero?.description || 'Reflections, pastoral insights, and spiritual encouragement from the Bethesda Community Church family in Kabankalan City.'}
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles, topics, or authors..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-[#E8D5B5]/40 text-white placeholder-stone-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869] focus:bg-white/15 transition-all shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-xs text-stone-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Navigation Pills / Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#7A121D] text-white shadow-sm'
                  : 'bg-white hover:bg-[#FAF6EE] text-slate-700 border border-[#E8D5B5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Category Header Strip (Matching 🏷️ Blog Category.png) */}
        {selectedCategory !== 'All' && (
          <div className="bg-[#FAF6EE] border border-[#E8D5B5] rounded-2xl p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A121D] mb-1">
                <Tag className="w-3.5 h-3.5 text-[#C99738]" />
                <span>Browsing Category</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                {selectedCategory}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} in this collection
              </p>
            </div>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-bold uppercase tracking-wider text-[#7A121D] hover:text-[#5C0612] underline"
            >
              View All Articles &rarr;
            </button>
          </div>
        )}

        {/* Featured Post Split Banner (Matching 🖋️ Blog V3.png) */}
        {featuredPost && (
          <div className="mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-[#E8D5B5] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 group"
            >
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                <img
                  src={featuredPost.coverImage || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200'}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent lg:hidden" />
              </div>
              <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
                <div>
                  {/* Unboxed Metadata (Zero-pill rule) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
                    <span className="font-bold text-[#7A121D] uppercase tracking-wider">
                      {featuredPost.category || 'Featured Article'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>4 min read</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900 group-hover:text-[#7A121D] transition-colors leading-tight mb-4">
                    <Link to={`/blogs/${featuredPost.slug || featuredPost.id}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-slate-600 font-light text-sm sm:text-base leading-relaxed line-clamp-4 mb-6">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#E8D5B5]/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7A121D] text-[#E5B869] font-display font-bold flex items-center justify-center text-sm border border-[#C99738]/40">
                      {featuredPost.authorName?.charAt(0) || 'B'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{featuredPost.authorName}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Bethesda Community</p>
                    </div>
                  </div>

                  <Link
                    to={`/blogs/${featuredPost.slug || featuredPost.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A121D] hover:text-[#5C0612] uppercase tracking-wider group/link"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C99738] group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Regular Blog Posts Grid */}
        {regularPosts.length === 0 && !featuredPost ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8D5B5] p-8">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-display font-bold text-slate-800">No articles found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any articles matching "{searchQuery || selectedCategory}". Try adjusting your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#7A121D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C0612] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-3xl overflow-hidden border border-[#E8D5B5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                <Link to={`/blogs/${post.slug || post.id}`} className="block relative aspect-[16/10] overflow-hidden border-b border-[#E8D5B5]/60 bg-stone-100">
                  <img 
                    src={post.coverImage || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
                </Link>

                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Unboxed Metadata (Zero-pill rule) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2.5">
                      <span className="font-bold text-[#7A121D] uppercase tracking-wider text-[11px]">
                        {post.category || 'Article'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>3 min</span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-slate-900 mb-2.5 group-hover:text-[#7A121D] transition-colors leading-snug line-clamp-2">
                      <Link to={`/blogs/${post.slug || post.id}`}>{post.title}</Link>
                    </h3>

                    <p className="text-slate-600 font-light text-xs sm:text-sm line-clamp-3 mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8D5B5]/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#7A121D] text-[#E5B869] text-xs font-bold flex items-center justify-center">
                        {post.authorName?.charAt(0) || 'B'}
                      </div>
                      <span className="text-xs text-slate-600 truncate max-w-[120px]">{post.authorName}</span>
                    </div>

                    <Link 
                      to={`/blogs/${post.slug || post.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#7A121D] hover:text-[#5C0612] uppercase tracking-wider transition-colors"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C99738] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
