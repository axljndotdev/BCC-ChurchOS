import { useState, useEffect } from 'react';
import { getAnnouncements, uploadFile, addAnnouncement, updateAnnouncement, deleteAnnouncement } from '../services/db';
import { Announcement } from '../types';
import { Megaphone, Plus, Trash2, Edit2, Search, Loader2, Image as ImageIcon, X, Upload } from 'lucide-react';
import { formatDate } from '../lib/utils';
import imageCompression from 'browser-image-compression';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [compressing, setCompressing] = useState(false);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      let imageUrl = formData.imageUrl;

      if (imageFile) {
        setCompressing(true);
        let fileToUpload = imageFile;
        // Basic compression
        if (fileToUpload.size > 200 * 1024) {
          const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1200,
            useWebWorker: true
          };
          fileToUpload = await imageCompression(fileToUpload, options);
        }
        setCompressing(false);

        imageUrl = await uploadFile(fileToUpload, 'announcements');
      }

      if (editingId) {
        await updateAnnouncement(editingId, {
          ...formData,
          imageUrl
        });
      } else {
        await addAnnouncement({
          ...formData,
          imageUrl,
          date: new Date() // date is handled by serverTimestamp in addAnnouncement but Announcement type needs it
        });
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', content: '', category: 'General', imageUrl: '' });
      setImageFile(null);
      setImagePreview('');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement. Please check your connection.');
    } finally {
      setSubmitting(false);
      setCompressing(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category || 'General',
      imageUrl: announcement.imageUrl || ''
    });
    setImageFile(null);
    setImagePreview(announcement.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
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
        <button onClick={() => { setEditingId(null); setFormData({ title: '', content: '', category: 'General', imageUrl: '' }); setImagePreview(''); setIsModalOpen(true); }} className="px-6 py-3 bg-maroon text-white rounded-xl font-bold flex items-center gap-2 hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/20">
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
              <div className="flex gap-4 items-start flex-1">
                {item.imageUrl && (
                  <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-50">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-maroon/5 text-maroon text-[10px] font-bold uppercase tracking-widest rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900 font-bold">{item.title}</h3>
                  <p className="text-slate-600 font-light text-sm line-clamp-2">{item.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(item)} className="p-2 text-slate-300 hover:text-maroon hover:bg-maroon/5 rounded-lg transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
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
            <h2 className="text-2xl font-display font-bold mb-6">{editingId ? 'Edit Announcement' : 'Post New Update'}</h2>
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Announcement Image</label>
                <div className="flex gap-4 items-start">
                  {imagePreview ? (
                    <div className="relative group h-32 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      <button 
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-maroon/30 transition-all cursor-pointer group">
                      <Upload className="h-6 w-6 text-slate-300 group-hover:text-maroon/50 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                    </label>
                  )}
                  <div className="flex-1 space-y-2">
                    <input 
                      className="w-full px-4 py-2 bg-slate-50 rounded-xl text-[10px] outline-none" 
                      placeholder="Or paste image URL..."
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    />
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest px-1">Recommended: 1200x600px</p>
                  </div>
                </div>
              </div>

              <button disabled={submitting} className="w-full py-4 bg-maroon text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {compressing ? 'Optimizing Photo...' : 'Saving...'}
                  </>
                ) : editingId ? 'Save Changes' : 'Post Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
