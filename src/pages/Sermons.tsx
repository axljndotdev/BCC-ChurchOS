import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSermons, getSystemSettings } from '../services/db';
import { Sermon, SystemSettings } from '../types';
import { Play, Search, Filter, Calendar, User, Video } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import LoadingSpinner from '../components/LoadingSpinner';
import LiveStream from '../components/LiveStream';

export default function Sermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sermonData, settingsData] = await Promise.all([
          getSermons(20),
          getSystemSettings()
        ]);
        setSermons(sermonData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20">
      {/* Header */}
      <section className="bg-slate-900 py-20 text-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight"
          >
            Sermon Archive
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto font-light"
          >
            Watch or listen to our past messages and grow in your faith.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Live Stream Section */}
        {settings?.isLive && settings?.facebookLiveUrl && (
          <div className="mb-16">
            <LiveStream url={settings.facebookLiveUrl} isLive={settings.isLive} />
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-12 flex flex-col md:flex-row gap-4 border border-slate-100">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or speaker..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-6 py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-slate-700 font-medium">
            <Filter className="h-5 w-5" /> Filter
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSermons.map((sermon, i) => (
              <motion.div 
                key={sermon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={sermon.thumbnail || 'https://images.unsplash.com/photo-1519491050282-ce00c729c8bf?auto=format&fit=crop&q=80&w=800'} 
                    alt={sermon.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 text-maroon fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(sermon.date)}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {sermon.speaker}</span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-2 group-hover:text-maroon transition-colors">{sermon.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 font-light">{sermon.notes}</p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-maroon bg-maroon/5 px-2 py-1 rounded">{sermon.scripture}</span>
                    <Link to={`/sermons/${sermon.id}`} className="text-sm font-bold text-slate-900 hover:text-maroon transition-colors">Watch Now</Link>
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
