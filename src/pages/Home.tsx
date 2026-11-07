import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Video, Users, Heart, Play, Quote, MessageSquare, Clock, Globe, X, ZoomIn, Maximize2, Shield, Settings, Sparkles, Compass, Baby, Shirt, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { getSermons, getSystemSettings, getEvents, getAnnouncements, getBlogPosts, getCampaignData, DEFAULT_AC_CAMPAIGN } from '../services/db';
import { Sermon, SystemSettings, ChurchEvent, Announcement, BlogPost, CampaignData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';
import CMSText from '../components/cms/CMSText';
import CMSImage from '../components/cms/CMSImage';
import CMSButton from '../components/cms/CMSButton';

export default function Home() {
  const { isSuperAdmin } = useAuth();
  const { pageData } = useCMS('home');
  const { pageData: ministriesPageData } = useCMS('ministries');
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [campaign, setCampaign] = useState<CampaignData>(DEFAULT_AC_CAMPAIGN);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sermons, sysSettings, events, news, blogs, campaignData] = await Promise.all([
          getSermons(1),
          getSystemSettings(),
          getEvents(),
          getAnnouncements(),
          getBlogPosts('published', 4),
          getCampaignData()
        ]);
        
        if (sermons.length > 0) setLatestSermon(sermons[0]);
        setSettings(sysSettings);
        if (campaignData) setCampaign(campaignData);
        
        // Filter for upcoming events only (event date >= start of today), sorted ascending (earliest upcoming first)
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const getEventTime = (event: ChurchEvent) => {
          if (!event.date) return 0;
          if (typeof event.date.toDate === 'function') return event.date.toDate().getTime();
          if (event.date.seconds) return event.date.seconds * 1000;
          const t = new Date(event.date).getTime();
          return isNaN(t) ? 0 : t;
        };

        const futureEvents = events
          .filter(event => getEventTime(event) >= startOfToday)
          .sort((a, b) => getEventTime(a) - getEventTime(b)); // Earliest upcoming first

        setUpcomingEvents(futureEvents.slice(0, 3));
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
  const heroSubtitle = pageData?.hero?.subtitle || "A Sanctuary for the Soul, A Family for the Heart";
  const heroDesc = pageData?.hero?.description || settings?.welcomeSubtitle || "Bethesda Community Church (BCC) is more than a building—it's a sanctuary for the soul and a family for the heart in Kabankalan City.";

  const primaryBtn = pageData?.hero?.primaryButton;
  const secondaryBtn = pageData?.hero?.secondaryButton;

  // Pastor Quote section from CMS
  const quoteSection = pageData?.sections?.find(s => s.id === 'home-quote-section');
  const quoteText = quoteSection?.content || settings?.pastorQuote || "We grow together in the Lord.";
  const quoteAuthor = quoteSection?.badge || settings?.pastorQuoteAuthor || "Pastor Fritz";

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-32 pb-24 sm:pb-32 relative bg-[#FAF7F2]">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="home" pageName="Home Page" />

      {/* Hero Section - Mobile First Editorial Saffron & Crimson Style */}
      {pageData?.hero?.visible !== false && (
        <section className="relative min-h-[85svh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-28 pb-12 sm:pb-20">
          {/* Live Stream floating indicator if live */}
          {settings?.isLive && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-20 sm:top-24 left-0 right-0 z-20 flex justify-center px-3 sm:px-4"
            >
              <Link 
                to="/live" 
                className="bg-[#7A121D] border border-[#E5B869] text-white px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-2 sm:gap-3 shadow-2xl hover:bg-[#5C0612] transition-all group max-w-[92vw] truncate"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5B869] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E5B869]"></span>
                </span>
                <span className="truncate">Live Now: Join Online Service</span>
                <ArrowRight className="h-3 w-3 shrink-0 group-hover:translate-x-1 transition-transform text-[#E5B869]" />
              </Link>
            </motion.div>
          )}

          {/* Hero Background Image with lighter, radiant ambient overlay */}
          <div className="absolute inset-0 z-0">
            <CMSImage
              src={heroImage}
              alt="Bethesda Community Church"
              className="w-full h-full object-cover brightness-[1.1] contrast-[1.02]"
              pageId="home"
              target={{ type: 'hero' }}
              title="Edit Homepage Hero Background Photo"
            />
            {/* Light, warm ambient gradient so the church sanctuary shines through clearly */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F0407]/60 via-[#3B070E]/30 to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
          
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-16 sm:py-24 md:py-32 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Eyebrow badge with gold diamonds */}
              <div className="mb-4 sm:mb-8">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 bg-black/50 backdrop-blur-md rounded-full border border-[#C99738]/60 text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] max-w-full shadow-lg">
                  <span className="text-[#E5B869] font-display select-none">✦</span>
                  <CMSText
                    pageId="home"
                    target={{ type: 'hero', field: 'badge' }}
                    fallbackText="Welcome to our Family"
                    label="Hero Badge"
                  >
                    {heroBadge}
                  </CMSText>
                  <span className="text-[#E5B869] font-display select-none">✦</span>
                </div>
              </div>
              
              {/* Grand display title (Scales smoothly from 320px mobile to 4k, boosted 50% on mobile) */}
              <h1 className="text-5xl xs:text-[3.5rem] sm:text-6xl md:text-7xl lg:text-8xl font-display text-white mb-4 sm:mb-8 leading-[1.04] sm:leading-[1.05] tracking-tight px-1 drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
                <CMSText
                  pageId="home"
                  target={{ type: 'hero', field: 'title' }}
                  fallbackText="Bethesda Family"
                  label="Hero Main Title"
                  className="font-display"
                >
                  {heroTitle}
                </CMSText>
              </h1>

              {/* Hero description */}
              <div className="mb-6 sm:mb-10 max-w-2xl mx-auto px-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                <CMSText
                  pageId="home"
                  target={{ type: 'hero', field: 'description' }}
                  fallbackText="Bethesda Community Church (BCC) is more than a building—it's a sanctuary for the soul and a family for the heart in Kabankalan City."
                  label="Hero Description"
                  multiline={true}
                  className="text-xs sm:text-base md:text-lg text-white/95 font-medium leading-relaxed block"
                >
                  {heroDesc}
                </CMSText>
              </div>
              
              {/* CTAs (Full width touch-friendly on phone, inline on desktop) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full max-w-xs sm:max-w-none mx-auto px-2 sm:px-0">
                <CMSButton
                  pageId="home"
                  target={{ type: 'hero', buttonKey: 'primaryButton' }}
                  buttonConfig={primaryBtn}
                  fallbackLabel="Our Story"
                  fallbackUrl="/about"
                  label="Primary Hero Button"
                  showArrow={false}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-[#7A121D] text-white border-2 border-[#C99738] rounded-full font-bold hover:bg-[#5C0612] hover:border-[#E5B869] transition-all duration-300 shadow-xl text-center text-xs uppercase tracking-widest min-h-[48px] flex items-center justify-center"
                />

                <CMSButton
                  pageId="home"
                  target={{ type: 'hero', buttonKey: 'secondaryButton' }}
                  buttonConfig={secondaryBtn}
                  fallbackLabel="Watch Live"
                  fallbackUrl="/live"
                  label="Secondary Hero Button"
                  showArrow={false}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 border-2 border-[#E8D5B5]/60 text-white rounded-full font-bold hover:bg-white/10 hover:border-[#E5B869] transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 text-xs uppercase tracking-widest min-h-[48px]"
                />
              </div>
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/40 animate-bounce pointer-events-none">
            <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-[#C99738] to-transparent mx-auto" />
          </div>
        </section>
      )}

      {/* Project AC Campaign Spotlight Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 relative z-20">
        <div className="bg-gradient-to-r from-[#5C0612] via-[#7A121D] to-[#4A0810] border-2 border-[#C99738]/50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-2xl text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 text-center lg:text-left">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[#E5B869] text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                <span className="font-display select-none">✦</span>
                <span>Active Church Campaign · Project AC</span>
                <span className="font-display select-none">✦</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-display text-white">
                Cool Sanctuary, Warm Fellowship
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm max-w-xl font-light mx-auto lg:mx-0">
                Help us install air conditioning in the main worship sanctuary for comfortable gatherings and multi-generational worship.
              </p>
            </div>

            {/* Campaign Progress Stats */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shrink-0 w-full lg:w-auto justify-end">
              <div className="text-center sm:text-right">
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#E5B869] font-semibold">Raised So Far</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-white">
                  ₱{campaign.currentAmount.toLocaleString()}
                  <span className="text-xs font-normal text-stone-300 ml-1">/ ₱{campaign.targetAmount.toLocaleString()}</span>
                </p>
              </div>

              <Link
                to="/project-ac"
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] rounded-full font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Support Campaign</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message / Pastor's Reflection Quote */}
      {quoteSection?.visible !== false && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative group">
          <div className="bg-[#FAF6EE] border border-[#E8D5B5] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 shadow-xs">
            <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-[#C99738]/50 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-3xl md:text-5xl font-display italic text-stone-900 mb-4 sm:mb-6 leading-snug sm:leading-relaxed">
              "
              <CMSText
                pageId="home"
                target={{ type: 'section', sectionId: 'home-quote-section', field: 'content' }}
                fallbackText="We grow together in the Lord."
                label="Pastor's Quote Message"
                multiline={true}
              >
                {quoteText}
              </CMSText>
              "
            </h2>
            
            {/* Elegant gold diamond divider */}
            <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
              <div className="w-12 sm:w-16 h-px bg-[#C99738]/40" />
              <span className="text-[#C99738] text-sm font-display select-none">✦</span>
              <div className="w-12 sm:w-16 h-px bg-[#C99738]/40" />
            </div>

            <div className="text-[#7A121D] font-bold tracking-widest uppercase text-xs">
              <CMSText
                pageId="home"
                target={{ type: 'section', sectionId: 'home-quote-section', field: 'badge' }}
                fallbackText="Pastor Fritz"
                label="Quote Author"
              >
                {quoteAuthor}
              </CMSText>
            </div>
          </div>
        </section>
      )}

      {/* Gather With Us & The Word - Dual Column Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-stretch">
          {/* Service Times / Gather With Us */}
          <div className="bg-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-xs border border-[#E8D5B5] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <span className="text-[11px] sm:text-xs font-bold text-[#7A121D] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="text-[#C99738]">✦</span> Worship & Gatherings
                </span>
                <Link to="/new-here" className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#9A6F1D] hover:text-[#7A121D] transition-colors flex items-center gap-1 min-h-[36px] py-1">
                  Plan Your Visit <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-stone-900 mb-3 sm:mb-4">Gather With Us</h2>
              <p className="text-stone-600 font-light leading-relaxed mb-6 sm:mb-8 text-xs sm:text-sm md:text-base">
                Whether you're exploring faith for the first time or looking for a church family to call home, our doors and hearts are wide open. Come as you are.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 pt-4 sm:pt-6 border-t border-[#E8D5B5]/60">
                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 border border-[#E8D5B5]/80 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[#7A121D] uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-1">
                      <span className="text-[#C99738]">✦</span> Sunday Worship Service
                    </p>
                    <p className="text-xl sm:text-2xl font-display text-stone-900 mb-1">8:45 AM</p>
                    <p className="text-xs text-stone-500">5-min countdown at 8:40 AM • Ends ~10:45 AM</p>
                  </div>
                  <p className="text-[11px] text-[#9A6F1D] font-medium mt-2 pt-2 border-t border-[#E8D5B5]/40">BCC Sanctuary & Live Stream</p>
                </div>
                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 border border-[#E8D5B5]/80 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[#7A121D] uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-1">
                      <span className="text-[#C99738]">✦</span> Kids & Toddler Care
                    </p>
                    <p className="text-xl sm:text-2xl font-display text-stone-900 mb-1">Sundays @ 8:45 AM</p>
                    <p className="text-xs text-stone-500">SBK 2nd Floor & Back Lounge for Nursing Moms</p>
                  </div>
                  <Link to="/new-here" className="inline-block text-[10px] font-bold text-[#7A121D] hover:text-[#5C0612] uppercase tracking-widest hover:underline py-1 mt-2 pt-2 border-t border-[#E8D5B5]/40">
                    What to Expect &rarr;
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#E8D5B5]/60 flex items-center justify-between">
              <span className="text-xs text-stone-500">In person in Kabankalan City</span>
              <div className="flex items-center gap-3">
                <Link to="/new-here" className="text-xs font-bold uppercase tracking-widest text-[#9A6F1D] hover:text-[#7A121D] transition-colors">
                  New Here?
                </Link>
                <span className="text-stone-300">|</span>
                <Link to="/live" className="text-xs font-bold uppercase tracking-widest text-[#7A121D] hover:text-[#5C0612] transition-colors flex items-center gap-1.5 min-h-[36px] py-1">
                  <Play className="h-3 w-3 text-[#C99738]" /> Watch Live
                </Link>
              </div>
            </div>
          </div>

          {/* The Word / Latest Blog */}
          <div className="bg-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-xs border border-[#E8D5B5] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <span className="text-[11px] sm:text-xs font-bold text-[#7A121D] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="text-[#C99738]">✦</span> Latest Reflection
                </span>
                <Link to="/blogs" className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#9A6F1D] hover:text-[#7A121D] transition-colors flex items-center gap-1 min-h-[36px] py-1">
                  Read Our Blog <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-stone-900 mb-4 sm:mb-6">The Word</h2>

              {latestBlogs[0] ? (
                <div className="space-y-4 sm:space-y-6">
                  <Link to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`} className="relative group cursor-pointer block rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] shadow-xs border border-[#E8D5B5]/60">
                    <img 
                      src={latestBlogs[0].coverImage || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200'} 
                      alt={latestBlogs[0].title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-all duration-500 flex items-center justify-center">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-500 border border-[#C99738]/50">
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#7A121D]" />
                      </div>
                    </div>
                  </Link>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Link to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`}>
                      <h3 className="text-xl sm:text-2xl font-display text-stone-900 hover:text-[#7A121D] transition-colors line-clamp-2 leading-snug">
                        {latestBlogs[0].title}
                      </h3>
                    </Link>
                    <p className="text-stone-600 font-light text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {latestBlogs[0].excerpt || "Explore shared faith and community insights in our latest church reflection."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 text-sm">No blog posts published yet.</p>
              )}
            </div>

            {latestBlogs[0] && (
              <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#E8D5B5]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#7A121D] text-[#E5B869] flex items-center justify-center font-display font-bold text-xs sm:text-sm border border-[#C99738]/40 shrink-0">
                    {latestBlogs[0].authorName?.charAt(0) || 'B'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-stone-900 truncate">by: {latestBlogs[0].authorName}</p>
                    <p className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-widest">{formatDate(latestBlogs[0].publishedAt || latestBlogs[0].createdAt)}</p>
                  </div>
                </div>
                <Link 
                  to={`/blogs/${latestBlogs[0].slug || latestBlogs[0].id}`}
                  className="text-xs font-bold uppercase tracking-widest text-[#7A121D] hover:text-[#5C0612] transition-colors flex items-center gap-1 min-h-[36px] py-1"
                >
                  Read &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Teaching & Media / Latest Sermon Showcase (Temporarily hidden for now) */}
      {/*
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] rounded-3xl sm:rounded-[2.5rem] border border-[#C99738]/40 overflow-hidden shadow-2xl p-6 sm:p-10 lg:p-14 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 relative group">
              <Link 
                to={latestSermon ? `/sermons/${latestSermon.id}` : '/sermons'} 
                className="block aspect-[16/9] rounded-2xl overflow-hidden relative border border-[#E8D5B5]/30 shadow-lg bg-stone-900"
              >
                {latestSermon?.thumbnail ? (
                  <img 
                    src={latestSermon.thumbnail} 
                    alt={latestSermon.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#3D040A] to-[#1A0B0E] flex items-center justify-center">
                    <Video className="w-16 h-16 text-[#C99738]/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#7A121D] text-[#E5B869] border-2 border-[#E5B869] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                  </div>
                </div>
                {latestSermon?.scripture && (
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-[#F0CA7D] border border-white/20">
                    {latestSermon.scripture}
                  </div>
                )}
              </Link>
            </div>

            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#F0CA7D] border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                <span>Featured Teaching & Media</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold leading-tight text-white">
                {latestSermon?.title || "Walking in Faith and Covenant Grace"}
              </h2>

              <div className="space-y-1.5 text-xs sm:text-sm text-stone-300 font-light">
                <p className="flex items-center gap-2 text-stone-200">
                  <Users className="w-4 h-4 text-[#E5B869]" />
                  <span>Speaker: <strong>{latestSermon?.speaker || "Pastor Fritz"}</strong></span>
                </p>
                {latestSermon?.date && (
                  <p className="flex items-center gap-2 text-stone-400">
                    <Calendar className="w-4 h-4 text-[#C99738]" />
                    <span>{formatDate(latestSermon.date)} · Sunday Morning Gathering</span>
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed line-clamp-3">
                {latestSermon?.notes || "Listen to the latest biblical exposition and encouragement from our Sunday gathering at Bethesda Community Church."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to={latestSermon ? `/sermons/${latestSermon.id}` : '/sermons'}
                  className="px-6 py-3 bg-[#7A121D] hover:bg-[#5C0612] text-white border border-[#E5B869] rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 min-h-[44px]"
                >
                  <span>Watch Message</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E5B869]" />
                </Link>
                <Link
                  to="/sermons"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] flex items-center justify-center"
                >
                  All Sermons &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* News & Events - Luxury Editorial Grid (Stacked on Mobile, 2-Col on Desktop) */}
      {(upcomingEvents.length > 0 || announcements.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-24">
            {/* Events */}
            {upcomingEvents.length > 0 && (
              <div className="space-y-6 sm:space-y-10">
                <div className="flex items-center justify-between border-b border-[#E8D5B5]/80 pb-3 sm:pb-4">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#7A121D] flex items-center gap-1.5">
                      <span className="text-[#C99738]">✦</span> Gatherings
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-stone-900 mt-0.5 sm:mt-1">Upcoming Events</h2>
                  </div>
                  <Link to="/events" className="text-xs font-bold uppercase tracking-widest text-[#9A6F1D] hover:text-[#7A121D] transition-colors min-h-[36px] flex items-center">
                    View All &rarr;
                  </Link>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {upcomingEvents.map((event) => (
                    <Link 
                      to={`/events/${event.slug || event.id}`} 
                      key={event.id} 
                      className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-[#FAF6EE] hover:bg-white transition-all duration-300 group border border-[#E8D5B5]/70 hover:border-[#C99738] shadow-xs hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
                    >
                      {/* Event Cover Photo with Date Badge Overlay */}
                      <div className="relative w-full sm:w-44 md:w-48 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0 bg-stone-900 border border-[#E8D5B5]">
                        {event.imageUrl ? (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#3D040A] to-[#1A0B0E] flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-[#C99738]/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Elegant Date Badge overlaid on Cover Photo */}
                        <div className="absolute top-2.5 left-2.5 bg-[#7A121D]/95 backdrop-blur-md border border-[#E5B869] rounded-lg px-2.5 py-1 text-center shadow-lg">
                          <span className="block text-sm sm:text-base font-display font-bold text-[#E5B869] leading-none">
                            {(() => {
                              const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                              return isNaN(d.getTime()) ? '--' : d.getDate();
                            })()}
                          </span>
                          <span className="block text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-wider leading-tight">
                            {(() => {
                              const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                              return isNaN(d.getTime()) ? '...' : d.toLocaleString('en-US', { month: 'short' });
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9A6F1D] mb-1">
                            <span>Upcoming Gathering</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-display font-bold text-stone-900 group-hover:text-[#7A121D] transition-colors line-clamp-2 leading-snug">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-xs text-stone-600 font-light line-clamp-2 mt-1.5 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-2 border-t border-[#E8D5B5]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2.5 text-stone-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#C99738] shrink-0" /> 
                              {(() => {
                                const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                                return isNaN(d.getTime()) ? 'TBA' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              })()}
                            </span>
                            <span aria-hidden="true" className="text-stone-300">·</span>
                            <span className="flex items-center gap-1 truncate max-w-[140px] xs:max-w-[180px]">
                              <Globe className="h-3.5 w-3.5 text-[#C99738] shrink-0" /> {event.location}
                            </span>
                          </div>

                          <span className="text-[11px] font-bold text-[#7A121D] group-hover:text-[#5C0612] flex items-center gap-1 tracking-wider uppercase">
                            Details &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Latest News */}
            {announcements.length > 0 && (
              <div className="space-y-6 sm:space-y-10">
                <div className="flex items-center justify-between border-b border-[#E8D5B5]/80 pb-3 sm:pb-4">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#7A121D] flex items-center gap-1.5">
                      <span className="text-[#C99738]">✦</span> Updates
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-stone-900 mt-0.5 sm:mt-1">Church News</h2>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Announcements</span>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {announcements.map((news) => (
                    <div 
                      key={news.id} 
                      className="flex flex-col xs:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-[#FAF6EE] group items-start border border-[#E8D5B5]/60 hover:border-[#C99738]/60 shadow-xs hover:shadow-md transition-all"
                    >
                      {news.imageUrl && (
                        <div className="w-full xs:w-24 h-40 xs:h-24 rounded-xl overflow-hidden shrink-0 border border-[#E8D5B5]">
                          <img src={news.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#7A121D] uppercase tracking-widest">
                          <span className="text-[#C99738]">✦</span>
                          <span>{formatDate(news.date)}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-display font-bold text-stone-900 group-hover:text-[#7A121D] transition-colors">{news.title}</h3>
                        <p className="text-stone-600 font-light text-xs sm:text-sm leading-relaxed line-clamp-2">{news.content}</p>
                        <button 
                          onClick={() => setSelectedAnnouncement(news)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#9A6F1D] hover:text-[#7A121D] transition-colors cursor-pointer flex items-center gap-1 min-h-[36px] py-1"
                        >
                          Read Details &rarr;
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

      {/* New to BCC? What to Expect When You Visit Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#FAF6EE] to-[#F5ECE0] border-2 border-[#E8D5B5] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white text-[#7A121D] border border-[#E8D5B5] rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 text-[#9A6F1D]" />
                <span>First Time at Bethesda?</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-stone-900 leading-tight">
                What Can You Expect When You Visit?
              </h2>
              <p className="text-stone-600 font-light text-xs sm:text-base leading-relaxed max-w-xl">
                We gather every Sunday for worship with quiet countdown at <strong>8:40 AM</strong> and service starting at <strong>8:45 AM</strong>. From our friendly welcoming greeters to our dedicated toddlers lounge & 2nd-level Superbook Kids worship, we've gathered answers to all your first-time questions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-stone-700 bg-white/80 p-2.5 rounded-xl border border-[#E8D5B5]/60">
                  <Clock className="h-4 w-4 text-[#9A6F1D] shrink-0" />
                  <span><strong>Sundays @ 8:45 AM</strong> (Countdown 8:40 AM)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-700 bg-white/80 p-2.5 rounded-xl border border-[#E8D5B5]/60">
                  <Shirt className="h-4 w-4 text-[#9A6F1D] shrink-0" />
                  <span>Modest Sunday's Best (Casual to Formal)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-700 bg-white/80 p-2.5 rounded-xl border border-[#E8D5B5]/60">
                  <Baby className="h-4 w-4 text-[#9A6F1D] shrink-0" />
                  <span>Mothers Lounge + 2nd Level Kids Worship</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-700 bg-white/80 p-2.5 rounded-xl border border-[#E8D5B5]/60">
                  <Music className="h-4 w-4 text-[#9A6F1D] shrink-0" />
                  <span>Classic Hymnal to Modern Praise</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/new-here"
                  className="px-6 py-3.5 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#5C0612] transition-all shadow-md flex items-center gap-2 border border-[#C99738]/50 min-h-[44px]"
                >
                  <span>Explore Plan Your Visit Guide</span>
                  <ArrowRight className="h-4 w-4 text-[#E5B869]" />
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3.5 bg-white text-stone-700 hover:text-[#7A121D] border border-[#E8D5B5] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FAF6EE] transition-all min-h-[44px] flex items-center justify-center"
                >
                  Contact Pastoral Team
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-[#E8D5B5] shadow-xs space-y-4">
              <span className="text-[10px] font-bold text-[#9A6F1D] uppercase tracking-widest block">
                New Sunday Service Flow Overview
              </span>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">8:40 AM</span>
                  <span>5-Minute Quiet Countdown</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">8:45 AM</span>
                  <span>Opening & Pastoral Prayer</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">9:00 AM</span>
                  <span>Congregational Singing & Hymns</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">9:20 AM</span>
                  <span>Welcome Song</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">9:25 AM</span>
                  <span>Scripture Reading</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">9:30 AM</span>
                  <span>Special Number</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">9:35 AM</span>
                  <span>Message</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">10:25 AM</span>
                  <span>Closing Song</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-800">10:30 AM</span>
                  <span>Closing Prayer & Benediction</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-[#7A121D]">~10:45 AM</span>
                  <span className="font-medium text-stone-800">Video Announcements & Fellowship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ministries / Life Together - Saffron & Warm Parchment Section */}
      {(() => {
        const lifeTogetherSection = pageData?.sections?.find(s => s.id === 'home-life-together') || pageData?.sections?.find(s => s.id === 'home-feature-cards');
        const ministriesCards = ministriesPageData?.sections?.find(s => s.id === 'ministries-list')?.cards;
        
        const sbkCard = ministriesCards?.find(c => c.id === 'superbook-kids-sbk');
        const youthCard = ministriesCards?.find(c => c.id === 'ignite-one-youth-fellowship');
        const discipleshipCard = ministriesCards?.find(c => c.id === 'discipleship-groups');

        const lifeTogetherMinistries = [
          { 
            id: 'superbook-kids-sbk',
            title: sbkCard?.title || 'Superbook Kids (SBK)', 
            image: sbkCard?.imageUrl || settings?.kidsMinistryImageUrl || 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800', 
            desc: sbkCard?.description || 'Nurturing the youngest hearts in the love of Jesus through fun, biblically-grounded teaching and activities.',
            link: sbkCard?.buttonUrl || '/ministries/superbook-kids-sbk'
          },
          { 
            id: 'ignite-one-youth-fellowship',
            title: youthCard?.title || 'Ignite One Youth Fellowship', 
            image: youthCard?.imageUrl || settings?.youthMinistryImageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800', 
            desc: youthCard?.description || 'A vibrant space for students to find their identity in Christ, build authentic friendships, and grow in faith.',
            link: youthCard?.buttonUrl || '/ministries/ignite-one-youth-fellowship'
          },
          { 
            id: 'discipleship-groups',
            title: discipleshipCard?.title || 'Discipleship Groups', 
            image: discipleshipCard?.imageUrl || settings?.communityMinistryImageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800', 
            desc: discipleshipCard?.description || "Small groups dedicated to studying God's Word, prayer, and mutual spiritual accountability for mature Christian living.",
            link: discipleshipCard?.buttonUrl || '/ministries/discipleship-groups'
          },
        ];

        return (
          <section className="py-16 sm:py-24 bg-[#F5EFEB] border-y border-[#E8D5B5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold uppercase tracking-widest text-[#7A121D] mb-2 sm:mb-3">
                  <span className="text-[#C99738]">✦</span>
                  <span>Connect & Grow</span>
                  <span className="text-[#C99738]">✦</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-stone-900 mb-4 sm:mb-6">
                  <CMSText
                    pageId="home"
                    target={{ type: 'section', sectionId: 'home-life-together', field: 'title' }}
                    fallbackText="Life Together"
                    label="Life Together Section Title"
                  >
                    {lifeTogetherSection?.title || 'Life Together'}
                  </CMSText>
                </h2>
                <div className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm md:text-base">
                  <CMSText
                    pageId="home"
                    target={{ type: 'section', sectionId: 'home-life-together', field: 'content' }}
                    fallbackText="We believe faith is best lived out in community. Discover the many ways you can connect, grow, and serve at BCC."
                    label="Life Together Section Subtitle"
                    multiline={true}
                  >
                    {lifeTogetherSection?.content || 'We believe faith is best lived out in community. Discover the many ways you can connect, grow, and serve at BCC.'}
                  </CMSText>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {lifeTogetherMinistries.map((item) => (
                  <div key={item.id} className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E8D5B5]/80 hover:border-[#C99738] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 relative border border-[#E8D5B5]/50">
                        <CMSImage 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          pageId="ministries"
                          target={{
                            type: 'card',
                            sectionId: 'ministries-list',
                            cardId: item.id
                          }}
                          title={`Edit ${item.title} Photo`}
                        />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-display text-stone-900 mb-2 sm:mb-3 group-hover:text-[#7A121D] transition-colors">
                        <CMSText
                          pageId="ministries"
                          target={{ type: 'card', sectionId: 'ministries-list', cardId: item.id, field: 'title' }}
                          fallbackText={item.title}
                          label={`Ministry Title: ${item.title}`}
                        >
                          {item.title}
                        </CMSText>
                      </h3>
                      <div className="text-stone-600 font-light text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                        <CMSText
                          pageId="ministries"
                          target={{ type: 'card', sectionId: 'ministries-list', cardId: item.id, field: 'description' }}
                          fallbackText={item.desc}
                          label={`Ministry Description: ${item.title}`}
                          multiline={true}
                        >
                          {item.desc}
                        </CMSText>
                      </div>
                    </div>
                    <div className="pt-3 sm:pt-4 border-t border-[#E8D5B5]/50">
                      <Link to={item.link} className="text-xs font-bold uppercase tracking-widest text-[#7A121D] hover:text-[#5C0612] transition-colors inline-flex items-center gap-1.5 min-h-[36px] py-1">
                        <span>Know More</span>
                        <ArrowRight className="h-3 w-3 text-[#C99738]" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* News Detail Modal (Responsive Mobile First Modal) */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="fixed inset-0"
            />
            <motion.div
              layoutId={`news-${selectedAnnouncement.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#FAF6EE] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88svh] flex flex-col z-10 my-auto border border-[#E8D5B5]"
            >
              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-5 border-b border-[#E8D5B5] flex items-center justify-between bg-white/70">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#7A121D] uppercase tracking-widest">
                  <span className="text-[#C99738]">✦</span>
                  {formatDate(selectedAnnouncement.date)}
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-stone-500 hover:text-[#7A121D] hover:bg-stone-200/50 rounded-full transition-colors"
                  id="close-news-modal"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-4 sm:space-y-6 overscroll-contain">
                {selectedAnnouncement.imageUrl && (
                  <div 
                    className="w-full relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8D5B5] shadow-xs mb-4 sm:mb-6 bg-white cursor-zoom-in group/img"
                    onClick={() => setSelectedImage(selectedAnnouncement.imageUrl!)}
                  >
                    <img 
                      src={selectedAnnouncement.imageUrl} 
                      alt="" 
                      className="w-full h-auto max-h-[340px] sm:max-h-[400px] object-contain mx-auto transition-transform duration-500 group-hover/img:scale-[1.02]" 
                    />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover/img:bg-stone-900/10 transition-colors flex items-center justify-center">
                      <Maximize2 className="h-6 w-6 sm:h-8 sm:w-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                  </div>
                )}
                <h2 className="text-xl sm:text-3xl md:text-4xl font-display text-stone-900 leading-snug sm:leading-tight">
                  {selectedAnnouncement.title}
                </h2>
                <div className="w-12 h-px bg-[#C99738]" />
                <p className="text-stone-700 font-light text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>

              <div className="shrink-0 px-4 sm:px-8 py-3.5 sm:py-5 border-t border-[#E8D5B5] bg-white/70 flex justify-between items-center">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] hidden sm:block">Bethesda Community Church</p>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#5C0612] transition-all ml-auto sm:ml-0 shadow-md border border-[#C99738]/50 min-h-[44px] flex items-center justify-center"
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
              className="fixed inset-0 bg-stone-950/95 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-7xl max-h-[88svh] z-10 flex flex-col items-center my-auto"
            >
              <div className="w-full flex justify-end mb-2">
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest min-h-[44px]"
                >
                  Close <X className="h-4 w-4" />
                </button>
              </div>
              <img 
                src={selectedImage} 
                alt="Full preview" 
                className="w-auto h-auto max-w-full max-h-[calc(88svh-4rem)] rounded-xl sm:rounded-2xl shadow-2xl object-contain border border-[#C99738]/30"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
