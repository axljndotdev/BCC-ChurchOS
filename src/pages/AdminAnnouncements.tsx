import { useState, useEffect } from 'react';
import { getAnnouncements } from '../services/db';
import { deleteDoc, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Announcement } from '../types';
import { Megaphone, Plus, Trash2, Edit2, Search, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements(100);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (!db) return;
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        date: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ title: '', content: '', category: 'General' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error adding announcement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      if (!db) return;
      await deleteDoc(doc(db, 'announcements', id));
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filtered = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">News & Announcements</h1>
          <p className="text-slate-500 font-light">Post updates, news, and urgent alerts for the BCC community.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-maroon text-white rounded-xl font-bold flex items-center gap-2 hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/20">
          <Plus className="h-5 w-5" /> New Announcement
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter updates..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-maroon mx-auto" /></div>
          ) : filtered.map((item) => (
            <div key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-maroon/5 text-maroon text-[10px] font-bold uppercase tracking-widest rounded">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 font-bold">{item.title}</h3>
                <p className="text-slate-600 font-light text-sm line-clamp-2">{item.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-20 text-center text-slate-400 italic">No announcements found.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-8">
            <h2 className="text-2xl font-display font-bold mb-6">Post New Update</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</label>
                <input required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>General</option>
                  <option>Service</option>
                  <option>Ministry</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content</label>
                <textarea required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none min-h-[150px]" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              <button disabled={submitting} className="w-full py-4 bg-maroon text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Post Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
