import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWeeklyActivities } from '../services/db';
import { WeeklyActivity } from '../types';
import { Calendar, Clock, MapPin, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

export default function WeeklyActivities() {
  const { pageData } = useCMS('activities');
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

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const heroImage = pageData?.hero?.imageUrl || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1920";

  return (
    <div className="space-y-16 pb-32 relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="activities" pageName="Weekly Activities" />

      {/* Header */}
      {pageData?.hero?.visible !== false && (
        <header className="relative py-24 px-4 overflow-hidden rounded-[3rem] bg-slate-900 text-center">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
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
                <Sparkles className="inline h-3 w-3 mr-1" /> {pageData?.hero?.badge || 'Community Life'}
              </span>
              <h1 className="text-5xl md:text-7xl font-display text-white mb-6">
                {pageData?.hero?.title || 'Weekly Activities'}
              </h1>
              {pageData?.hero?.subtitle && (
                <p className="text-amber-400 font-medium mb-3 text-lg">
                  {pageData.hero.subtitle}
                </p>
              )}
              <p className="text-slate-300 font-light leading-relaxed">
                {pageData?.hero?.description || 'Find your place in our weekly rhythms of worship, study, and fellowship.'}
              </p>
            </motion.div>
          </div>
        </header>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-maroon" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 p-12">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-slate-700 mb-2">No Activities Scheduled</h3>
            <p className="text-slate-400 font-light text-sm max-w-md mx-auto">
              Please check back soon for updates to our weekly calendar.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {days.map((day) => {
              const dayActivities = activities.filter(a => a.day === day || (a as any).dayOfWeek === day);
              if (dayActivities.length === 0) return null;

              return (
                <div key={day} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">{day}</h2>
                    {day === 'Sunday' && (
                      <span className="px-3 py-1 bg-maroon/10 text-maroon text-xs font-bold rounded-full uppercase tracking-wider">
                        Lord's Day Gathering
                      </span>
                    )}
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {day === 'Sunday' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6EE] to-[#F5ECE1] border border-[#E8D5B5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#C99738] shrink-0" />
                        <span><strong>Sunday Rhythm:</strong> Quiet countdown begins at <strong>8:40 AM</strong> &bull; Service at <strong>8:45 AM</strong> &bull; Concludes ~<strong>10:45 AM</strong></span>
                      </div>
                      <Link to="/new-here" className="font-bold text-[#7A121D] hover:underline shrink-0">
                        What to Expect &rarr;
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dayActivities.map((act) => (
                      <div 
                        key={act.id}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <span className="inline-block px-3 py-1 bg-maroon/5 text-maroon rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {act.category || 'Gathering'}
                          </span>
                          <h3 className="text-xl font-display font-bold text-slate-900">{act.title}</h3>
                          <p className="text-slate-500 font-light text-sm leading-relaxed">{act.description}</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 space-y-2 text-xs text-slate-400 font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-maroon" />
                            <span>{act.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-maroon" />
                            <span>{act.location}</span>
                          </div>
                        </div>
                      </div>
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
