import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEventsByYear } from '../services/db';
import { ChurchEvent } from '../types';
import { Calendar, MapPin, ArrowRight, Clock, ChevronDown, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

export default function Events() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearDropdown, setShowYearDropdown] = useState(false);

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
  const upcomingEvents = events.filter(e => {
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    return d >= now;
  });

  const pastEvents = events.filter(e => {
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    return d < now;
  });

  return (
    <div className="pb-20">
      {/* Header */}
      <section className="bg-maroon py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-white/10">
              <Calendar className="h-3 w-3" />
              Church Calendar
            </div>
            <div className="relative inline-block mb-4">
              <button 
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="text-4xl md:text-6xl font-display font-bold tracking-tighter flex items-center gap-3 group"
              >
                {selectedYear} Events
                <ChevronDown className={cn("h-8 w-8 text-white/50 group-hover:text-white transition-all", showYearDropdown && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showYearDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-50 min-w-[200px]"
                  >
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                        className={cn(
                          "w-full px-8 py-4 text-left text-lg font-bold hover:bg-slate-50 transition-colors",
                          selectedYear === year ? "text-maroon bg-maroon/5" : "text-slate-600"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-white/70 max-w-2xl mx-auto font-light text-lg">
              Explore our scheduled activities and previous milestones at Bethesda Community Church.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Calendar...</p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Upcoming Section */}
            {upcomingEvents.length > 0 && (
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Upcoming Events</h2>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {upcomingEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} i={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Section */}
            {pastEvents.length > 0 && (
              <section className="space-y-10">
                <div className="flex items-center gap-4 opacity-50">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Past Events</h2>
                  </div>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event, i) => (
                    <SmallEventCard key={event.id} event={event} i={i} />
                  ))}
                </div>
              </section>
            )}

            {events.length === 0 && (
              <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                <Calendar className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-display font-bold text-slate-800">No Events Scheduled</h3>
                <p className="text-slate-500 font-light max-w-sm mx-auto mt-2">
                  We don't have any events listed for {selectedYear} yet. Please try another year or check back soon!
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <button 
                    onClick={() => setSelectedYear(currentYear)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
                  >
                    View {currentYear}
                  </button>
                  <button 
                    onClick={() => setSelectedYear(currentYear + 1)}
                    className="px-6 py-3 bg-maroon text-white rounded-2xl text-sm font-bold shadow-lg shadow-maroon/20 hover:bg-maroon-dark transition-all"
                  >
                    Upcoming Year
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
            <Calendar className="h-16 w-16" />
          </div>
        )}
        <div className="absolute top-6 left-6 bg-white rounded-[1.5rem] p-3 text-center min-w-[70px] shadow-2xl">
          <p className="text-[10px] font-black text-maroon uppercase tracking-widest mb-1">
            {isValid ? d.toLocaleDateString('en-US', { month: 'short' }) : '...'}
          </p>
          <p className="text-2xl font-black text-slate-900 leading-none">
            {isValid ? d.getDate() : '--'}
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div className="p-8">
        <h3 className="text-2xl font-display font-bold text-slate-900 mb-4 group-hover:text-maroon transition-colors">{event.title}</h3>
        <p className="text-slate-500 font-light leading-relaxed line-clamp-2 mb-6">
          {event.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Clock className="h-4 w-4 text-maroon" />
            {isValid ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBA'}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <MapPin className="h-4 w-4 text-maroon" />
            {event.location}
          </div>
        </div>

        <Link 
          to={`/events/${event.slug || event.id}`}
          className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-maroon transition-all group-hover:px-10"
        >
          Explore Details
          <ArrowRight className="h-4 w-4" />
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
      className="group flex gap-5 p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300"
    >
      <div className="shrink-0 w-16 h-16 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center border border-slate-100 group-hover:bg-maroon group-hover:border-maroon transition-colors overflow-hidden">
        <p className="text-[8px] font-black text-slate-400 group-hover:text-white uppercase tracking-tighter leading-none mb-1">
          {isValid ? d.toLocaleDateString('en-US', { month: 'short' }) : '...'}
        </p>
        <p className="text-lg font-black text-slate-900 group-hover:text-white leading-none">
          {isValid ? d.getDate() : '--'}
        </p>
      </div>
      <div>
        <h4 className="font-display font-bold text-slate-900 group-hover:text-maroon transition-colors line-clamp-1">{event.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{event.location}</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
          <Link to={`/events/${event.slug || event.id}`} className="hover:text-maroon">View</Link>
        </div>
      </div>
    </motion.div>
  );
}

