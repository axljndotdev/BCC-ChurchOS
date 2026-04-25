import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Video, Users, Heart, Play, Quote, MessageSquare, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { getSermons, getSystemSettings, getEvents, getAnnouncements, getBlogPosts } from '../services/db';
import { Sermon, SystemSettings, ChurchEvent, Announcement, BlogPost } from '../types';

export default function Home() {
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
        setUpcomingEvents(events.slice(0, 3));
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

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section - Editorial Style */}
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
                key={settings?.heroImageUrl || 'default'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                src={settings?.heroImageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920"} 
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
            <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-6 sm:mb-8 border border-white/20">
              Welcome to our Family
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-display text-white mb-8 leading-[0.8] tracking-tighter">
              {settings?.welcomeTitle?.split(' ')[0] || 'Bethesda'} <br />
              <span className="italic font-light opacity-90">{settings?.welcomeTitle?.split(' ')[1] || 'Family'}</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-100 mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              {settings?.welcomeSubtitle || "Bethesda Community Church (BCC) is more than a building—it's a sanctuary for the soul and a family for the heart in Kabankalan City."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/about" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 rounded-full font-medium hover:bg-slate-100 transition-all duration-300 shadow-xl text-center">
                Our Story
              </Link>
              <Link to="/live" className="w-full sm:w-auto px-10 py-4 border border-white/40 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2">
                <Play className="h-4 w-4" /> Watch Live
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <div className="w-px h-12 bg-white/30 mx-auto" />
        </div>
      </section>

      {/* Welcome Message / Quote */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <Quote className="h-12 w-12 text-maroon/20 mx-auto mb-8" />
        <h2 className="text-4xl md:text-5xl font-display italic text-slate-800 mb-8 leading-tight">
          "In Bethesda, we grow together in the Lord."
        </h2>
        <div className="w-20 h-px bg-maroon mx-auto mb-8" />
        <p className="text-slate-500 font-light tracking-wide uppercase text-sm">Pastor Fritz</p>
      </section>

      {/* Service Times - Warm Organic */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:max-w-md">
            <h2 className="text-4xl font-display text-slate-900 mb-6">Gather With Us</h2>
            <p className="text-slate-600 font-light leading-relaxed mb-8">
              Whether you're a lifelong believer or just starting to ask questions, our doors are wide open. Come as you are.
            </p>
            <Link to="/contact" className="text-maroon font-medium flex items-center gap-2 hover:gap-4 transition-all">
              Get Directions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 w-full lg:w-auto">
            <div className="p-8 border-l border-slate-100">
              <p className="text-xs font-semibold text-maroon uppercase tracking-widest mb-4">Sunday Morning</p>
              <p className="text-3xl font-display text-slate-900 mb-2">9:00 & 11:00 AM</p>
              <p className="text-sm text-slate-400">BCC Main Hall & FB Live</p>
            </div>
            <div className="p-8 border-l border-slate-100">
              <p className="text-xs font-semibold text-maroon uppercase tracking-widest mb-4">Wednesday Night</p>
              <p className="text-3xl font-display text-slate-900 mb-2">7:00 PM</p>
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Mid-week Prayer Meeting</p>
                <Link to="/activities" className="inline-block text-[10px] font-bold text-maroon uppercase tracking-widest hover:underline">
                  Explore Weekly Activities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Featured - Minimal Editorial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
          <h2 className="text-5xl font-display text-slate-900">The Word</h2>
          <Link to="/blogs" className="text-slate-400 hover:text-maroon transition-colors flex items-center gap-2 uppercase text-xs tracking-widest font-bold">
            Read Our Blog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {latestBlogs[0] && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <Link to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`} className="lg:col-span-7 relative group cursor-pointer block">
              <div className="aspect-[16/9] rounded-[2rem] overflow-hidden">
                <img 
                  src={latestBlogs[0].coverImage || `https://picsum.photos/seed/${latestBlogs[0].id}/1200/675`} 
                  alt={latestBlogs[0].title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all duration-500 rounded-[2rem] flex items-center justify-center">
                <div className="h-20 w-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                  <ArrowRight className="h-8 w-8 text-maroon" />
                </div>
              </div>
            </Link>
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-maroon uppercase tracking-widest">Latest Reflection</span>
                <Link to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`}>
                  <h3 className="text-5xl font-display text-slate-900 leading-tight hover:text-maroon transition-colors line-clamp-3">{latestBlogs[0].title}</h3>
                </Link>
                <p className="text-slate-600 font-light leading-relaxed text-lg line-clamp-3">
                  {latestBlogs[0].excerpt || "Explore shared faith and community insights in our latest church reflection."}
                </p>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-maroon font-display text-xl font-bold">
                  {latestBlogs[0].authorName?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="font-display text-xl text-slate-900">by: {latestBlogs[0].authorName}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">{formatDate(latestBlogs[0].publishedAt || latestBlogs[0].createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

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
              { title: 'BCC Kids', image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800', desc: 'Nurturing the youngest hearts in the love of Jesus.' },
              { title: 'Youth Collective', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800', desc: 'A space for students to find their identity in Christ.' },
              { title: 'Community Groups', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800', desc: 'Doing life together in homes across our city.' },
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

      {/* News & Events - Visible Grid */}
      {(upcomingEvents.length > 0 || announcements.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-display text-slate-900">Upcoming</h2>
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
                    <div key={news.id} className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-maroon uppercase tracking-widest">
                        <span className="h-1 w-1 bg-maroon rounded-full"></span>
                        {formatDate(news.date)}
                      </div>
                      <h3 className="text-2xl font-display font-bold text-slate-900">{news.title}</h3>
                      <p className="text-slate-500 font-light text-sm leading-relaxed line-clamp-2">{news.content}</p>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-maroon transition-colors">Read More</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gospel Message - Immersive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[4rem] overflow-hidden py-32 px-8 text-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=1920" 
              alt="Gospel" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-display text-white mb-10 leading-tight">A New Beginning <br /><span className="italic font-light">Awaits You</span></h2>
            <p className="text-xl text-slate-200 mb-12 font-light leading-relaxed">
              No matter your past, God has a future filled with hope for you. Salvation is a gift of grace, freely given to all who believe.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/contact" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 rounded-full font-medium hover:bg-slate-100 transition-all">
                I'm New Here
              </Link>
              <Link to="/prayer" className="w-full sm:w-auto px-10 py-4 border border-white/40 text-white rounded-full font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Heart className="h-4 w-4" /> Request Prayer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
