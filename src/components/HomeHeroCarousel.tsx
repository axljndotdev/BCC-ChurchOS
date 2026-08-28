import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Calendar, Clock, MapPin, Play, Star, ChevronLeft, ChevronRight, 
  Megaphone, BookOpen, Pause, Sparkles, Settings
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { SystemSettings, ChurchEvent, Announcement, BlogPost } from '../types';

export interface HeroSlide {
  id: string;
  type: 'welcome' | 'event' | 'news' | 'blog';
  badge: string;
  badgeIcon?: any;
  title: string;
  subtitle?: string;
  description?: string;
  dateStr?: string;
  timeStr?: string;
  location?: string;
  imageUrl?: string;
  primaryLink: string;
  primaryText: string;
  secondaryLink?: string;
  secondaryText?: string;
  rawItem?: any;
}

interface HomeHeroCarouselProps {
  settings: SystemSettings | null;
  events: ChurchEvent[];
  announcements: Announcement[];
  blogs: BlogPost[];
  isSuperAdmin?: boolean;
  onOpenNewsModal?: (news: Announcement) => void;
}

export default function HomeHeroCarousel({
  settings,
  events,
  announcements,
  blogs,
  isSuperAdmin,
  onOpenNewsModal
}: HomeHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Build slides based on tagged items & welcome slide
  const slides: HeroSlide[] = [];

  // 1. Welcome Slide (Always present)
  slides.push({
    id: 'welcome-slide',
    type: 'welcome',
    badge: 'Welcome to Bethesda',
    badgeIcon: Sparkles,
    title: settings?.welcomeTitle || 'Bethesda Community Church',
    subtitle: 'A Sanctuary for the Soul & A Family for the Heart',
    description: settings?.welcomeSubtitle || "Bethesda Community Church (BCC) is more than a building—it's a sanctuary for the soul and a family for the heart in Kabankalan City.",
    imageUrl: settings?.heroImageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920",
    primaryLink: '/about',
    primaryText: 'Our Story',
    secondaryLink: '/live',
    secondaryText: 'Watch Live'
  });

  // 2. Tagged Events (or closest upcoming event if tagged events are empty)
  const taggedEvents = events.filter(e => e.featuredInHero);
  const eventsToShow = taggedEvents.length > 0 ? taggedEvents : events.slice(0, 1);

  eventsToShow.forEach((event) => {
    const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
    const dateFormatted = isNaN(d.getTime()) ? 'Upcoming Date' : formatDate(event.date);
    const timeFormatted = isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    slides.push({
      id: `event-${event.id}`,
      type: 'event',
      badge: event.featuredInHero ? 'Featured Upcoming Event' : 'Upcoming Event',
      badgeIcon: Calendar,
      title: event.title,
      description: event.description,
      dateStr: dateFormatted,
      timeStr: timeFormatted,
      location: event.location,
      imageUrl: event.imageUrl || settings?.heroImageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920",
      primaryLink: `/events/${event.slug || event.id}`,
      primaryText: 'Event Details & RSVP',
      secondaryLink: '/events',
      secondaryText: 'All Events',
      rawItem: event
    });
  });

  // 3. Tagged Church News / Announcements
  const taggedNews = announcements.filter(a => a.featuredInHero);
  taggedNews.forEach((news) => {
    slides.push({
      id: `news-${news.id}`,
      type: 'news',
      badge: `Church News: ${news.category || 'Update'}`,
      badgeIcon: Megaphone,
      title: news.title,
      description: news.content,
      dateStr: formatDate(news.date),
      imageUrl: news.imageUrl || settings?.heroImageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920",
      primaryLink: '#read-news',
      primaryText: 'Read Full Update',
      secondaryLink: '/activities',
      secondaryText: 'Church Activities',
      rawItem: news
    });
  });

  // 4. Tagged Blog Posts
  const taggedBlogs = blogs.filter(b => b.featuredInHero);
  taggedBlogs.forEach((blog) => {
    slides.push({
      id: `blog-${blog.id}`,
      type: 'blog',
      badge: 'Featured Reflection',
      badgeIcon: BookOpen,
      title: blog.title,
      description: blog.excerpt || blog.content?.slice(0, 140) + '...',
      dateStr: formatDate(blog.publishedAt || blog.createdAt),
      imageUrl: blog.coverImage || settings?.heroImageUrl || "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1920",
      primaryLink: `/blogs/${blog.slug || blog.id}`,
      primaryText: 'Read Pastoral Reflection',
      secondaryLink: '/blogs',
      secondaryText: 'Explore Blog',
      rawItem: blog
    });
  });

  const autoplayInterval = (settings?.heroAutoplayInterval || 7) * 1000;

  // Autoplay handler
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, autoplayInterval]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe Handling for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrev();

    setTouchStart(null);
    setTouchEnd(null);
  };

  const activeSlide = slides[currentIndex] || slides[0];
  const BadgeIcon = activeSlide.badgeIcon || Sparkles;

  return (
    <section 
      className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-stone-950 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Home Hero Carousel"
    >
      {/* Background Image Carousel with Seamless Transitions */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + activeSlide.imageUrl}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={activeSlide.imageUrl} 
              alt={activeSlide.title} 
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Multi-Layer Gradient Overlays for Peak Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-900/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-stone-950/80" />
      </div>

      {/* Top Live Broadcast Banner */}
      {settings?.isLive && (
        <motion.div 
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-20 sm:top-24 left-0 right-0 z-30 flex justify-center px-4"
        >
          <Link 
            to="/live" 
            className="bg-red-600/95 backdrop-blur-md text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-2xl shadow-red-600/30 hover:bg-red-600 transition-all group border border-red-400/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Live Now: Join Online Service
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      {/* Super Admin Quick Hero Carousel Config Tag */}
      {isSuperAdmin && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-amber-300 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-400/30 shadow-lg transition-all"
            title="Configure Hero Spotlight & Slides"
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Hero Carousel Manager</span>
          </Link>
        </div>
      )}

      {/* Main Slide Content Card */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Category / Type Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 bg-white/10 backdrop-blur-md text-amber-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-4 sm:mb-6 border border-white/15 shadow-inner">
              <BadgeIcon className="h-3.5 w-3.5 fill-current" />
              <span>{activeSlide.badge}</span>
            </div>

            {/* Slide Title - Mobile-First Fluid Typography */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display text-white mb-4 sm:mb-6 leading-[1.05] tracking-tight max-w-4xl drop-shadow-md">
              {activeSlide.title}
            </h1>

            {/* Event Specific Metadata Bar */}
            {activeSlide.type === 'event' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6 px-4 py-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-xs sm:text-sm text-slate-200"
              >
                {activeSlide.dateStr && (
                  <span className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Calendar className="h-4 w-4" /> {activeSlide.dateStr}
                  </span>
                )}
                {activeSlide.timeStr && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Clock className="h-4 w-4 text-amber-400" /> {activeSlide.timeStr}
                  </span>
                )}
                {activeSlide.location && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="h-4 w-4 text-red-400" /> {activeSlide.location}
                  </span>
                )}
              </motion.div>
            )}

            {/* News Specific Metadata */}
            {activeSlide.type === 'news' && activeSlide.dateStr && (
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>Published {activeSlide.dateStr}</span>
              </div>
            )}

            {/* Description / Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-200 mb-8 sm:mb-10 max-w-2xl font-light leading-relaxed drop-shadow line-clamp-3 sm:line-clamp-4">
              {activeSlide.description}
            </p>

            {/* Call to Action Buttons - Mobile Responsive Grid/Stack */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-5 max-w-md sm:max-w-none">
              {activeSlide.type === 'news' && onOpenNewsModal ? (
                <button
                  type="button"
                  onClick={() => onOpenNewsModal(activeSlide.rawItem)}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-full transition-all duration-300 shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Megaphone className="h-4 w-4" /> {activeSlide.primaryText}
                </button>
              ) : (
                <Link 
                  to={activeSlide.primaryLink} 
                  className={cn(
                    "w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base text-center",
                    activeSlide.type === 'event'
                      ? "bg-amber-500 hover:bg-amber-400 text-stone-950"
                      : "bg-white hover:bg-slate-100 text-slate-900"
                  )}
                >
                  {activeSlide.type === 'event' && <Calendar className="h-4 w-4" />}
                  {activeSlide.primaryText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {activeSlide.secondaryLink && (
                <Link 
                  to={activeSlide.secondaryLink} 
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 text-sm sm:text-base text-center"
                >
                  {activeSlide.type === 'welcome' && <Play className="h-4 w-4 fill-current text-amber-400" />}
                  {activeSlide.secondaryText}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows for Desktop / Tablet */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/15 items-center justify-center transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/15 items-center justify-center transition-all"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Carousel Slide Indicators & Mobile Touch Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "transition-all duration-300 rounded-full h-2.5 focus:outline-none flex items-center justify-center",
                  currentIndex === idx 
                    ? "w-8 bg-amber-400 shadow-lg shadow-amber-400/50" 
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                )}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-white/60 uppercase tracking-widest font-bold">
            <span>Slide {currentIndex + 1} of {slides.length}</span>
            {isPaused && (
              <span className="flex items-center gap-1 text-amber-300/90">
                <Pause className="h-2.5 w-2.5" /> Paused
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
