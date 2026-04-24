import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWeeklyActivities } from '../services/db';
import { WeeklyActivity } from '../types';
import { Calendar, Clock, MapPin, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function WeeklyActivities() {
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getWeeklyActivities();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching weekly activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-16 pb-32">
      <header className="relative py-24 px-4 overflow-hidden rounded-[3rem] bg-slate-900 text-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1920" 
            alt="Weekly Activities" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1.5 bg-maroon/20 backdrop-blur-md text-maroon rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-maroon/30">
              Community Life
            </span>
            <h1 className="text-5xl md:text-7xl font-display text-white mb-6">Weekly Activities</h1>
            <p className="text-slate-300 font-light leading-relaxed">
              Find your place in our weekly rhythms of worship, study, and fellowship.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-maroon" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-900 font-display font-bold text-xl">Coming Soon</h3>
            <p className="text-slate-500">We are currently updating our weekly schedule. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-24">
            {days.map((day) => {
              const dayActivities = activities.filter(a => a.day === day);
              if (dayActivities.length === 0) return null;

              return (
                <div key={day} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-3">
                    <div className="sticky top-24">
                      <h2 className="text-4xl font-display text-slate-900 mb-2">{day}</h2>
                      <div className="w-12 h-1.5 bg-maroon rounded-full" />
                    </div>
                  </div>
                  <div className="lg:col-span-9 space-y-8">
                    {dayActivities.map((activity, i) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-maroon/10 transition-all group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                          <div className="space-y-2">
                             <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              activity.category === 'Spiritual' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              activity.category === 'Fellowship' ? "bg-blue-50 text-blue-600 border-blue-100" :
                              activity.category === 'Service' ? "bg-green-50 text-green-600 border-green-100" :
                              "bg-slate-50 text-slate-600 border-slate-100"
                            )}>
                              {activity.category}
                            </span>
                            <h3 className="text-2xl font-display font-bold text-slate-900 group-hover:text-maroon transition-colors">
                              {activity.title}
                            </h3>
                            {activity.ministryId && (
                              <Link 
                                to={`/ministries/${activity.ministryId}`} 
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-maroon hover:underline uppercase tracking-widest mt-1"
                              >
                                View Ministry <Sparkles className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 tracking-wider">
                            <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                              <Clock className="h-3.5 w-3.5 text-maroon" />
                              {activity.time}
                            </span>
                            <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                              <MapPin className="h-3.5 w-3.5 text-maroon" />
                              {activity.location}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 font-light leading-relaxed">
                          {activity.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
