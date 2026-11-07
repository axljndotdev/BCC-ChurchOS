import { useState, useEffect } from 'react';
import { getSystemSettings, getSermons } from '../services/db';
import { SystemSettings, Sermon } from '../types';
import { motion } from 'motion/react';
import LiveStream from '../components/LiveStream';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, User, Clock, Share2, Facebook, Sparkles } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

export default function Live() {
  const { pageData } = useCMS('live');
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
    <div className="pb-24 sm:pb-32 bg-[#FAF7F2] min-h-screen relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="live" pageName="Live Broadcast Page" />

      {/* Immersive Header */}
      {pageData?.hero?.visible !== false && (
        <section className="bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] pt-14 sm:pt-20 md:pt-28 pb-20 sm:pb-32 md:pb-44 relative overflow-hidden border-b border-[#C99738]/30">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7A121D] to-transparent" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-2xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>{pageData?.hero?.badge || 'Direct from Kabankalan City'}</span>
              </div>
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-3 sm:mb-6 tracking-tight">
                {pageData?.hero?.title || 'Bethesda Online'}
              </h1>
              {pageData?.hero?.subtitle && (
                <p className="text-base sm:text-xl text-[#E5B869] font-display italic mb-2 sm:mb-3">
                  {pageData.hero.subtitle}
                </p>
              )}
              <p className="text-stone-300 max-w-2xl mx-auto font-light leading-relaxed text-xs sm:text-base">
                {pageData?.hero?.description || 'Join our church family for worship, prayer, and common life, no matter where you are in the world.'}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Broadcast Center */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-24 md:-mt-32 relative z-20">
        <LiveStream 
          url={settings?.facebookLiveUrl || ''} 
          isLive={!!settings?.isLive} 
          className="bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8D5B5]"
        />

        {/* Live Interaction / Share */}
        {settings?.isLive && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-10 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-[#E8D5B5] overflow-hidden relative"
          >
            <div className="max-w-md">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 mb-2 sm:mb-3 tracking-tight">Watching with your Family?</h2>
              <p className="text-stone-600 font-light leading-relaxed text-xs sm:text-sm">
                We'd love to know where you're joining us from! Leave a comment on the Facebook stream or share this service with someone who needs to hear the Word.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <a 
                href={settings.facebookLiveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#1877F2] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#166fe5] transition-all flex items-center justify-center gap-2.5 shadow-lg min-h-[44px]"
              >
                <Facebook className="h-4 w-4" /> Open FB Comments
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Sermons / Catch up */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-[#E8D5B5] pb-3 sm:pb-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#7A121D] flex items-center gap-1.5">
              <span className="text-[#C99738]">✦</span> Archives
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-stone-900 mt-0.5">Recent Messages</h2>
          </div>
          <Link to="/sermons" className="text-xs font-bold uppercase tracking-widest text-[#9A6F1D] hover:text-[#7A121D] transition-colors min-h-[36px] flex items-center">
            View Archive &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {recentSermons.map((sermon) => (
            <Link key={sermon.id} to="/sermons" className="group space-y-3 bg-[#FAF6EE] p-4 sm:p-5 rounded-2xl border border-[#E8D5B5] hover:border-[#C99738] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-xs mb-3 relative border border-[#E8D5B5]">
                  <img 
                    src={sermon.thumbnail || 'https://images.unsplash.com/photo-1519491050282-ce00c729c8bf?auto=format&fit=crop&q=80&w=800'} 
                    alt={sermon.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    <Calendar className="h-3 w-3 text-[#C99738]" /> {formatDate(sermon.date)}
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-stone-900 group-hover:text-[#7A121D] transition-colors line-clamp-2 leading-snug">{sermon.title}</h3>
                  <p className="text-stone-600 font-light text-xs sm:text-sm italic">{sermon.speaker}</p>
                </div>
              </div>
              <div className="pt-2 text-xs font-bold uppercase tracking-widest text-[#7A121D] flex items-center gap-1">
                <span>Listen to Sermon</span> &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
