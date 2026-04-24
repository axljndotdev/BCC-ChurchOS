import { useState, useEffect } from 'react';
import { getSermons, addSermon } from '../services/db';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sermon } from '../types';
import { Video, Plus, Trash2, Edit2, Search, ExternalLink, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function AdminSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: new Date().toISOString().split('T')[0],
    videoUrl: '',
    notes: '',
    scripture: '',
    thumbnail: ''
  });

  const fetchSermons = async () => {
    try {
      const data = await getSermons(100);
      setSermons(data);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await addSermon({
        ...formData,
        date: new Date(formData.date)
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        speaker: '',
        date: new Date().toISOString().split('T')[0],
        videoUrl: '',
        notes: '',
        scripture: '',
        thumbnail: ''
      });
      fetchSermons();
    } catch (error) {
      console.error('Error adding sermon:', error);
      alert('Failed to add sermon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sermon?')) return;
    try {
      if (!db) return;
      await deleteDoc(doc(db, 'sermons', id));
      fetchSermons();
    } catch (error) {
      console.error('Error deleting sermon:', error);
    }
  };

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Sermon Management</h1>
          <p className="text-slate-500">Upload and organize your sermon archive.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-maroon text-white rounded-xl font-bold hover:bg-maroon-dark transition-all scale-100 hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" /> Add Sermon
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter sermons..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Sermon</th>
                <th className="px-6 py-4">Speaker & Date</th>
                <th className="px-6 py-4">Scripture</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-maroon mx-auto" />
                  </td>
                </tr>
              ) : filteredSermons.map((sermon) => (
                <tr key={sermon.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={sermon.thumbnail || 'https://picsum.photos/seed/sermon/200/120'} 
                          alt="" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{sermon.title}</p>
                        <a href={sermon.videoUrl} target="_blank" rel="noreferrer" className="text-[10px] text-maroon hover:underline flex items-center gap-1">
                          View Link <ExternalLink className="h-2 w-2" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{sermon.speaker}</p>
                    <p className="text-xs text-slate-400">{formatDate(sermon.date)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {sermon.scripture}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sermon.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSermons.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-light italic">
                    No sermons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h2 className="text-2xl font-display font-bold text-slate-900">Add New Sermon</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sermon Title</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Speaker Name</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    value={formData.speaker}
                    onChange={e => setFormData({...formData, speaker: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scripture Reference</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    placeholder="e.g. John 3:16"
                    value={formData.scripture}
                    onChange={e => setFormData({...formData, scripture: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Video URL (YouTube/Vimeo)</label>
                  <input 
                    required
                    type="url"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    placeholder="https://..."
                    value={formData.videoUrl}
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thumbnail Image URL</label>
                  <input 
                    type="url"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    placeholder="https://..."
                    value={formData.thumbnail}
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes / Description</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none min-h-[100px]"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-colors shadow-lg shadow-maroon/20 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Sermon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
