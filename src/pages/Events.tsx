import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/db';
import { ChurchEvent } from '../types';
import { Calendar, MapPin, Users, ArrowRight, Clock } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Events() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="pb-20">
      {/* Header */}
      <section className="bg-maroon py-20 text-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight"
          >
            Upcoming Events
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 max-w-2xl mx-auto font-light"
          >
            There's always something happening at Bethesda Community Church. Join us for worship, community, and service.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 relative aspect-video md:aspect-auto">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <Calendar className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white rounded-xl p-2 text-center min-w-[60px] shadow-lg">
                    <p className="text-xs font-bold text-maroon uppercase">
                      {(() => {
                        const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                        return isNaN(d.getTime()) ? '...' : d.toLocaleDateString('en-US', { month: 'short' });
                      })()}
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {(() => {
                        const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                        return isNaN(d.getTime()) ? '--' : d.getDate();
                      })()}
                    </p>
                  </div>
                </div>
                <div className="p-8 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">{event.title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed font-light">{event.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <Clock className="h-5 w-5 text-maroon" />
                        <span>
                          {(() => {
                            const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                            return isNaN(d.getTime()) ? 'TBA' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <MapPin className="h-5 w-5 text-maroon" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <Link 
                      to={`/events/${event.slug || event.id}`}
                      className="px-8 py-3 bg-maroon text-white rounded-full font-bold hover:bg-maroon-dark transition-all hover:scale-105 shadow-lg shadow-maroon/20"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
