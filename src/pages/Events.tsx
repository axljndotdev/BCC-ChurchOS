import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getEventsByYear } from '../services/db';
import { ChurchEvent } from '../types';
import { Calendar, MapPin, ArrowRight, Clock, ChevronDown, Sparkles, Search, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

const CATEGORIES = [
  'All Events',
  'Sunday Worship',
  'Youth & Kids',
  'Prayer & Fellowship',
  'Special Events'
];

export default function Events() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [selectedYear]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEventsByYear(selectedYear);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 4 }, (_, i) => currentYear + 1 - i).sort((a, b) => b - a);

  const now = new Date();
  
  // Filter by category and search
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = !searchQuery.trim() ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All Events' ||
        (selectedCategory === 'Sunday Worship' && e.title.toLowerCase().includes('sunday')) ||
        (selectedCategory === 'Youth & Kids' && (e.title.toLowerCase().includes('youth') || e.title.toLowerCase().includes('kids') || e.title.toLowerCase().includes('sbk'))) ||
        (selectedCategory === 'Prayer & Fellowship' && (e.title.toLowerCase().includes('prayer') || e.title.toLowerCase().includes('fellowship') || e.title.toLowerCase().includes('huddle')));

      return matchesSearch && matchesCat;
    });
  }, [events, searchQuery, selectedCategory]);

  const upcomingEvents = filteredEvents.filter(e => {
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    return d >= now;
  });

  const pastEvents = filteredEvents.filter(e => {
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    return d < now;
  });

  // Featured event is the next upcoming event
  const featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const regularUpcoming = featuredEvent ? upcomingEvents.slice(1) : upcomingEvents;

  return (
    <div className="pb-24 sm:pb-32 bg-[#FAF7F2] min-h-screen">
      {/* Header - Matching ⭐️ Events.png */}
      <section className="bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] pt-16 sm:pt-24 pb-16 sm:pb-20 text-center text-white relative overflow-hidden border-b border-[#C99738]/30">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A121D] to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-2xl">
              <span className="text-[#E5B869] font-display">✦</span>
              <span>Church Gatherings & Milestones</span>
              <span className="text-[#E5B869] font-display">✦</span>
            </div>
            
            <div className="relative inline-block mb-3 sm:mb-4">
              <button 
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight flex items-center justify-center gap-2 sm:gap-3 group hover:text-[#E5B869] transition-colors"
                aria-label="Select event year"
              >
                <span>{selectedYear} Events</span>
                <ChevronDown className={cn("h-6 w-6 sm:h-8 sm:w-8 text-[#C99738] group-hover:text-white transition-all", showYearDropdown && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showYearDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-[#FDFBF7] rounded-2xl shadow-2xl overflow-hidden border border-[#E8D5B5] z-50 min-w-[200px]"
                  >
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                        className={cn(
                          "w-full px-6 py-3.5 text-left text-sm font-bold transition-colors min-h-[44px] flex items-center justify-between",
                          selectedYear === year ? "text-[#7A121D] bg-[#FAF6EE] font-extrabold" : "text-stone-700 hover:bg-[#FAF6EE]"
                        )}
                      >
                        <span>{year} Calendar</span>
                        {selectedYear === year && <span className="text-[#C99738]">✦</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-stone-300 max-w-2xl mx-auto font-light text-xs sm:text-base leading-relaxed mb-6">
              Connect with the Bethesda Community Church family in Kabankalan City through worship services, fellowships, and outreach events.
            </p>

            {/* Search Input */}
            <div className="w-full max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event title or location..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-[#E8D5B5]/40 text-white placeholder-stone-400 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869] transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-4 mb-10 no-scrollbar">
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">Loading Calendar...</p>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {/* Featured Event Spotlight Card (Matching ⭐️ Events.png) */}
            {featuredEvent && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A121D] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C99738]" /> Next Upcoming Gathering
                  </span>
                </div>

                <div className="bg-white rounded-3xl border border-[#E8D5B5] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-stone-100">
                    {featuredEvent.imageUrl ? (
                      <img 
                        src={featuredEvent.imageUrl} 
                        alt={featuredEvent.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[260px] bg-[#FAF6EE] flex items-center justify-center text-[#C99738]/40">
                        <Calendar className="h-16 w-16" />
                      </div>
                    )}
                    
                    {/* Date Badge */}
                    <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md rounded-2xl p-3 text-center min-w-[70px] shadow-lg border border-[#E8D5B5]">
                      <p className="text-[10px] font-bold text-[#7A121D] uppercase tracking-wider mb-0.5">
                        {(() => {
                          const d = featuredEvent.date?.toDate ? featuredEvent.date.toDate() : new Date(featuredEvent.date);
                          return isNaN(d.getTime()) ? '...' : d.toLocaleDateString('en-US', { month: 'short' });
                        })()}
                      </p>
                      <p className="text-2xl font-display font-extrabold text-stone-900 leading-none">
                        {(() => {
                          const d = featuredEvent.date?.toDate ? featuredEvent.date.toDate() : new Date(featuredEvent.date);
                          return isNaN(d.getTime()) ? '--' : d.getDate();
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C99738]" />
                          {(() => {
                            const d = featuredEvent.date?.toDate ? featuredEvent.date.toDate() : new Date(featuredEvent.date);
                            return isNaN(d.getTime()) ? 'TBA' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                          })()}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#C99738]" />
                          {featuredEvent.location}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 group-hover:text-[#7A121D] transition-colors leading-tight mb-4">
                        {featuredEvent.title}
                      </h3>

                      <p className="text-slate-600 font-light text-sm sm:text-base leading-relaxed line-clamp-4 mb-6">
                        {featuredEvent.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-[#E8D5B5]/60 flex items-center justify-between">
                      <Link 
                        to={`/events/${featuredEvent.slug || featuredEvent.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A121D] hover:bg-[#5C0612] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                      >
                        <span>View Event Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E5B869]" />
                      </Link>
                      <span className="text-xs text-slate-400 font-medium">BCC Calendar</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Grid */}
            {regularUpcoming.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E8D5B5] pb-3">
                  <h3 className="text-xs font-bold text-[#7A121D] uppercase tracking-[0.25em] flex items-center gap-2">
                    <span className="text-[#C99738]">✦</span> Upcoming Calendar
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">{regularUpcoming.length} upcoming</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {regularUpcoming.map((event, i) => (
                    <EventCard key={event.id} event={event} i={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-[#E8D5B5]/80">
                <div className="flex items-center gap-2 pb-2">
                  <History className="h-4 w-4 text-[#C99738]" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-[0.25em]">Past Gatherings ({selectedYear})</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {pastEvents.map((event, i) => (
                    <SmallEventCard key={event.id} event={event} i={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border border-[#E8D5B5] p-6 sm:p-12">
                <Calendar className="h-12 w-12 text-[#C99738]/50 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900">No Events Found</h3>
                <p className="text-stone-600 font-light max-w-sm mx-auto mt-2 text-xs sm:text-sm">
                  We don't have any events matching your search or filters for {selectedYear}.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button 
                    onClick={() => {
                      setSelectedCategory('All Events');
                      setSearchQuery('');
                    }}
                    className="px-6 py-2.5 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#5C0612] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, i }: { event: ChurchEvent, i: number }) {
  const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const isValid = !isNaN(d.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      className="group bg-white rounded-3xl overflow-hidden border border-[#E8D5B5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[16/10] overflow-hidden border-b border-[#E8D5B5]/60 bg-stone-100">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="w-full h-full bg-[#FAF6EE] flex items-center justify-center text-[#C99738]/40">
              <Calendar className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center min-w-[62px] shadow-lg border border-[#E8D5B5]">
            <p className="text-[10px] font-bold text-[#7A121D] uppercase tracking-wider mb-0.5">
              {isValid ? d.toLocaleDateString('en-US', { month: 'short' }) : '...'}
            </p>
            <p className="text-xl font-display font-bold text-stone-900 leading-none">
              {isValid ? d.getDate() : '--'}
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#C99738]" />
              {isValid ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBA'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="h-3.5 w-3.5 text-[#C99738]" />
              <span className="truncate">{event.location}</span>
            </span>
          </div>

          <h3 className="text-lg font-display font-bold text-stone-900 mb-2 group-hover:text-[#7A121D] transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>
          <p className="text-stone-600 font-light leading-relaxed line-clamp-2 text-xs sm:text-sm">
            {event.description}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0 border-t border-[#E8D5B5]/60 mt-2 flex items-center justify-between">
        <Link 
          to={`/events/${event.slug || event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7A121D] hover:text-[#5C0612] transition-colors py-2"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#C99738] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

function SmallEventCard({ event, i }: { event: ChurchEvent, i: number }) {
  const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const isValid = !isNaN(d.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex gap-4 p-4 bg-white rounded-2xl border border-[#E8D5B5] hover:border-[#C99738] shadow-xs hover:shadow-md transition-all duration-300"
    >
      <div className="shrink-0 w-14 h-14 bg-[#FAF6EE] rounded-xl flex flex-col items-center justify-center border border-[#E8D5B5] group-hover:bg-[#7A121D] group-hover:border-[#7A121D] transition-colors">
        <p className="text-[9px] font-bold text-stone-500 group-hover:text-[#E5B869] uppercase tracking-wider leading-none mb-0.5">
          {isValid ? d.toLocaleDateString('en-US', { month: 'short' }) : '...'}
        </p>
        <p className="text-base font-display font-bold text-stone-900 group-hover:text-white leading-none">
          {isValid ? d.getDate() : '--'}
        </p>
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <h4 className="font-display font-bold text-stone-900 group-hover:text-[#7A121D] transition-colors line-clamp-1 text-sm">{event.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500">
          <span className="truncate">{event.location}</span>
          <span className="text-stone-300">·</span>
          <Link to={`/events/${event.slug || event.id}`} className="font-bold text-[#7A121D] hover:underline uppercase tracking-wider">Details</Link>
        </div>
      </div>
    </motion.div>
  );
}
