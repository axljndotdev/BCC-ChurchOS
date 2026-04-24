import { useState, useEffect } from 'react';
import { getSystemSettings, getSermons } from '../services/db';
import { SystemSettings, Sermon } from '../types';
import { motion } from 'motion/react';
import LiveStream from '../components/LiveStream';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, User, Clock, Share2, Facebook } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Live() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, sermonsData] = await Promise.all([
          getSystemSettings(),
          getSermons(3)
        ]);
        setSettings(settingsData);
        setRecentSermons(sermonsData);
      } catch (error) {
        console.error('Error fetching live settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      {/* Immersive Header */}
      <section className="bg-slate-900 pt-32 pb-64 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-maroon to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-500/50 rounded-full text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-2xl shadow-red-600/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Direct from Kabankalan
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
              Bethesda <span className="italic font-light">Online</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Join our church family for worship, prayer, and common life, no matter where you are in the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Broadcast Center */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-20">
        <LiveStream 
          url={settings?.facebookLiveUrl || ''} 
          isLive={!!settings?.isLive} 
          className="bg-white p-4 sm:p-8 rounded-[3rem] shadow-2xl border border-slate-100"
        />

        {/* Live Interaction / Share */}
        {settings?.isLive && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 p-12 bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Facebook className="h-32 w-32" />
            </div>
            
            <div className="max-w-md">
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4 tracking-tight">Watching with your Family?</h2>
              <p className="text-slate-500 font-light leading-relaxed">
                We'd love to know where you're joining us from! Leave a comment on the Facebook stream or share this service with someone who needs to hear the Word.
              </p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <a 
                href={settings.facebookLiveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
              >
                <Facebook className="h-5 w-5" /> Open FB Comments
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Sermons / Catch up */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Recent Messages</h2>
          <Link to="/sermons" className="text-xs font-bold uppercase tracking-widest text-maroon hover:text-slate-900 transition-colors">Archive</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {recentSermons.map((sermon) => (
            <Link key={sermon.id} to="/sermons" className="group space-y-4">
              <div className="aspect-video rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img 
                  src={sermon.thumbnail || 'https://images.unsplash.com/photo-1519491050282-ce00c729c8bf?auto=format&fit=crop&q=80&w=800'} 
                  alt={sermon.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="h-3 w-3" /> {formatDate(sermon.date)}
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-maroon transition-colors line-clamp-1">{sermon.title}</h3>
                <p className="text-slate-500 font-light text-sm italic">{sermon.speaker}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
