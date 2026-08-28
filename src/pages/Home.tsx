import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Video, Users, Heart, Play, Quote, MessageSquare, Clock, Globe, X, ZoomIn, Maximize2, Shield, Settings, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { getSermons, getSystemSettings, getEvents, getAnnouncements, getBlogPosts } from '../services/db';
import { Sermon, SystemSettings, ChurchEvent, Announcement, BlogPost } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

export default function Home() {
  const { isSuperAdmin } = useAuth();
  const { pageData } = useCMS('home');
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sermons, sysSettings, events, news, blogs] = await Promise.all([
          getSermons(1),
          getSystemSettings(),
          getEvents(),
          getAnnouncements(),
          getBlogPosts('published', 4)
        ]);
        
        if (sermons.length > 0) setLatestSermon(sermons[0]);
        setSettings(sysSettings);
        
        // Sort events descending by date (newest event on top)
        const sortedEvents = [...events].sort((a, b) => {
          const getEventTime = (event: ChurchEvent) => {
            if (!event.date) return 0;
            if (typeof event.date.toDate === 'function') return event.date.toDate().getTime();
            if (event.date.seconds) return event.date.seconds * 1000;
            const t = new Date(event.date).getTime();
            return isNaN(t) ? 0 : t;
          };
          return getEventTime(b) - getEventTime(a);
        });

        setUpcomingEvents(sortedEvents.slice(0, 3));
        setAnnouncements(news.slice(0, 3));
        setLatestBlogs(blogs);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroImage = pageData?.hero?.imageUrl || settings?.heroImageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920";
  const heroBadge = pageData?.hero?.badge || "Welcome to our Family";
  const heroTitle = pageData?.hero?.title || settings?.welcomeTitle || "Bethesda Family";
  const heroSubtitle = pageData?.hero?.subtitle || "";
  const heroDesc = pageData?.hero?.description || settings?.welcomeSubtitle || "Bethesda Community Church (BCC) is more than a building—it's a sanctuary for the soul and a family for the heart in Kabankalan City.";

  const primaryBtn = pageData?.hero?.primaryButton;
  const secondaryBtn = pageData?.hero?.secondaryButton;

  // Pastor Quote section from CMS
  const quoteSection = pageData?.sections?.find(s => s.id === 'home-quote-section');
  const quoteText = quoteSection?.content || settings?.pastorQuote || "We grow together in the Lord.";
  const quoteAuthor = quoteSection?.badge || settings?.pastorQuoteAuthor || "Pastor Fritz";

  return (
    <div className="space-y-32 pb-32 relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="home" pageName="Home Page" />

      {/* Hero Section - Editorial Style */}
      {pageData?.hero?.visible !== false && (
        <section className="relative min-h-screen md:h-screen flex items-center justify-center overflow-hidden">
          {/* Live Banner */}
          {settings?.isLive && (
            <motion.div 
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              className="absolute top-24 left-0 right-0 z-20 flex justify-center px-4"
            >
              <Link 
                to="/live" 
                className="bg-red-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-red-600/20 hover:bg-red-700 transition-all group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Live Now: Join Our Online Service
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}

          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              {loading ? (
                <div key="loader" className="w-full h-full bg-stone-950" />
              ) : (
                <motion.img 
                  key={heroImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  src={heroImage} 
                  alt="Bethesda Community Church" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-stone-900/40" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {heroBadge && (
                <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-6 sm:mb-8 border border-white/20">
                  {heroBadge}
                </span>
              )}
              
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-display text-white mb-6 leading-[0.85] tracking-tighter">
                {heroTitle.includes(' ') ? (
                  <>
                    {heroTitle.split(' ')[0]} <br />
                    <span className="italic font-light opacity-90">{heroTitle.split(' ').slice(1).join(' ')}</span>
                  </>
                ) : (
                  heroTitle
                )}
              </h1>

              {heroSubtitle && (
                <p className="text-xl sm:text-2xl text-amber-300 font-medium mb-4">
                  {heroSubtitle}
                </p>
              )}

              <p className="text-lg sm:text-xl text-slate-100 mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                {heroDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                {primaryBtn?.visible !== false && (
                  <Link 
                    to={primaryBtn?.url || "/about"} 
                    className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl text-center text-xs uppercase tracking-widest"
                  >
                    {primaryBtn?.label || 'Our Story'}
                  </Link>
                )}
                {secondaryBtn?.visible !== false && (
                  <Link 
                    to={secondaryBtn?.url || "/live"} 
                    className="w-full sm:w-auto px-10 py-4 border border-white/40 text-white rounded-full font-bold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                  >
                    <Play className="h-4 w-4" /> {secondaryBtn?.label || 'Watch Live'}
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
            <div className="w-px h-12 bg-white/30 mx-auto" />
          </div>
        </section>
      )}

      {/* Welcome Message / Quote */}
      {quoteSection?.visible !== false && (
        <section className="max-w-4xl mx-auto px-4 text-center relative group">
          <Quote className="h-12 w-12 text-maroon/20 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-display italic text-slate-800 mb-8 leading-tight">
            "{quoteText}"
          </h2>
          <div className="w-20 h-px bg-maroon mx-auto mb-8" />
          <p className="text-slate-500 font-light tracking-wide uppercase text-sm">
            {quoteAuthor}
          </p>
        </section>
      )}

      {/* Gather With Us & The Word - Dual Column Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Service Times / Gather With Us */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-maroon uppercase tracking-widest">Worship & Gatherings</span>
                <Link to="/contact" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-maroon transition-colors flex items-center gap-1.5">
                  Get Directions <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display text-slate-900 mb-4">Gather With Us</h2>
              <p className="text-slate-600 font-light leading-relaxed mb-8 text-sm sm:text-base">
                Whether you're a lifelong believer or just starting to ask questions, our doors are wide open. Come as you are.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-slate-100">
                <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-maroon uppercase tracking-widest mb-2">Sunday Morning</p>
                    <p className="text-2xl font-display text-slate-900 mb-1">9:00 & 11:00 AM</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">BCC Main Hall & FB Live</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-maroon uppercase tracking-widest mb-2">Wednesday Night</p>
                    <p className="text-2xl font-display text-slate-900 mb-1">6:00 PM</p>
                    <p className="text-xs text-slate-400 mb-3">Mid-week Prayer Meeting</p>
                  </div>
                  <Link to="/activities" className="inline-block text-[10px] font-bold text-maroon uppercase tracking-widest hover:underline">
                    Weekly Activities &rarr;
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Join us in person or online</span>
              <Link to="/live" className="text-xs font-bold uppercase tracking-widest text-maroon hover:text-slate-900 transition-colors flex items-center gap-2">
                <Play className="h-3 w-3" /> Watch Live
              </Link>
            </div>
          </div>

          {/* The Word / Latest Blog */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-maroon uppercase tracking-widest">Latest Reflection</span>
                <Link to="/blogs" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-maroon transition-colors flex items-center gap-1.5">
                  Read Our Blog <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display text-slate-900 mb-6">The Word</h2>

              {latestBlogs[0] ? (
                <div className="space-y-6">
                  <Link to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`} className="relative group cursor-pointer block rounded-2xl overflow-hidden aspect-[16/9] shadow-sm">
                    <img 
                      src={latestBlogs[0].coverImage || `https://picsum.photos/seed/${latestBlogs[0].id}/1200/675`} 
                      alt={latestBlogs[0].title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all duration-500 flex items-center justify-center">
                      <div className="h-12 w-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
                        <ArrowRight className="h-5 w-5 text-maroon" />
                      </div>
                    </div>
                  </Link>
                  <div className="space-y-2">
                    <Link to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`}>
                      <h3 className="text-2xl font-display text-slate-900 hover:text-maroon transition-colors line-clamp-2 leading-snug">
                        {latestBlogs[0].title}
                      </h3>
                    </Link>
                    <p className="text-slate-500 font-light text-sm line-clamp-2 leading-relaxed">
                      {latestBlogs[0].excerpt || "Explore shared faith and community insights in our latest church reflection."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No blog posts published yet.</p>
              )}
            </div>

            {latestBlogs[0] && (
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-maroon font-display font-bold text-sm">
                    {latestBlogs[0].authorName?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <p className="font-display text-sm text-slate-900">by: {latestBlogs[0].authorName}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{formatDate(latestBlogs[0].publishedAt || latestBlogs[0].createdAt)}</p>
                  </div>
                </div>
                <Link 
                  to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`}
                  className="text-xs font-bold uppercase tracking-widest text-maroon hover:text-slate-900 transition-colors"
                >
                  Read Post &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* News & Events - Visible Grid */}
      {(upcomingEvents.length > 0 || announcements.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Events */}
            {upcomingEvents.length > 0 && (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-display text-slate-900">Events</h2>
                  <Link to="/events" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-maroon transition-colors">View All</Link>
                </div>
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <Link to={`/events/${event.slug || event.id}`} key={event.id} className="flex gap-6 p-6 rounded-[2rem] hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                      <div className="h-20 w-20 bg-maroon/5 rounded-2xl flex flex-col items-center justify-center shrink-0">
                        <span className="text-2xl font-display font-bold text-maroon">
                          {(() => {
                            const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                            return isNaN(d.getTime()) ? '--' : d.getDate();
                          })()}
                        </span>
                        <span className="text-[10px] font-bold text-maroon/60 uppercase tracking-widest">
                          {(() => {
                            const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                            return isNaN(d.getTime()) ? '...' : d.toLocaleString('en-US', { month: 'short' });
                          })()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-bold text-slate-900 mb-2 group-hover:text-maroon transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 
                            {(() => {
                              const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                              return isNaN(d.getTime()) ? 'TBA' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            })()}
                          </span>
                          <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {event.location}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Latest News */}
            {announcements.length > 0 && (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-display text-slate-900">Church News</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Updates</span>
                </div>
                <div className="space-y-8">
                  {announcements.map((news) => (
                    <div key={news.id} className="flex gap-6 group items-start">
                      {news.imageUrl && (
                        <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                          <img src={news.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-maroon uppercase tracking-widest">
                          <span className="h-1 w-1 bg-maroon rounded-full"></span>
                          {formatDate(news.date)}
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-900 group-hover:text-maroon transition-colors">{news.title}</h3>
                        <p className="text-slate-500 font-light text-sm leading-relaxed line-clamp-2">{news.content}</p>
                        <button 
                          onClick={() => setSelectedAnnouncement(news)}
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-maroon transition-colors cursor-pointer"
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ministries - Soft Rounded Cards */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-5xl font-display text-slate-900 mb-8">Life Together</h2>
            <p className="text-slate-500 font-light leading-relaxed">
              We believe faith is best lived out in community. Discover the many ways you can connect, grow, and serve at BCC.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'BCC Kids', 
                image: settings?.kidsMinistryImageUrl || 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800', 
                desc: 'Nurturing the youngest hearts in the love of Jesus.' 
              },
              { 
                title: 'Youth Collective', 
                image: settings?.youthMinistryImageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800', 
                desc: 'A space for students to find their identity in Christ.' 
              },
              { 
                title: 'Community Groups', 
                image: settings?.communityMinistryImageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800', 
                desc: 'Doing life together in homes across our city.' 
              },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-2xl font-display text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 font-light text-sm leading-relaxed mb-6">{item.desc}</p>
                <Link to="/ministries" className="text-xs font-bold uppercase tracking-widest text-maroon hover:text-slate-900 transition-colors">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="fixed inset-0"
            />
            <motion.div
              layoutId={`news-${selectedAnnouncement.id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col z-10 my-auto"
            >
              <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3 text-[10px] font-bold text-maroon uppercase tracking-widest">
                  <span className="h-2 w-2 bg-maroon rounded-full"></span>
                  {formatDate(selectedAnnouncement.date)}
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 text-slate-400 hover:text-maroon hover:bg-slate-100 rounded-full transition-colors"
                  id="close-news-modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 md:p-10 space-y-6 overscroll-contain">
                {selectedAnnouncement.imageUrl && (
                  <div 
                    className="w-full relative rounded-2xl sm:rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm mb-6 bg-slate-50 cursor-zoom-in group/img"
                    onClick={() => setSelectedImage(selectedAnnouncement.imageUrl!)}
                  >
                    <img 
                      src={selectedAnnouncement.imageUrl} 
                      alt="" 
                      className="w-full h-auto max-h-[400px] object-contain mx-auto transition-transform duration-500 group-hover/img:scale-[1.02]" 
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/10 transition-colors flex items-center justify-center">
                      <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                )}
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-display text-slate-900 leading-tight">
                  {selectedAnnouncement.title}
                </h2>
                <div className="w-12 h-px bg-maroon/20" />
                <p className="text-slate-600 font-light text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>

              <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden sm:block">Bethesda Community Church</p>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-maroon transition-all ml-auto sm:ml-0"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[200] overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-7xl max-h-[calc(100dvh-2rem)] z-10 flex flex-col items-center my-auto"
            >
              <div className="w-full flex justify-end mb-2">
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  Close <X className="h-4 w-4" />
                </button>
              </div>
              <img 
                src={selectedImage} 
                alt="Full preview" 
                className="w-auto h-auto max-w-full max-h-[calc(100dvh-5rem)] rounded-2xl shadow-2xl object-contain border border-white/10"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
