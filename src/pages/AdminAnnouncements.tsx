import { useState, useEffect } from 'react';
import { getAnnouncements, uploadFile, addAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncementHeroFeature } from '../services/db';
import { Announcement } from '../types';
import { Megaphone, Plus, Trash2, Edit2, Search, Loader2, Image as ImageIcon, X, Upload, Star } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
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
    imageUrl: '',
    featuredInHero: false
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

  const handleToggleHero = async (item: Announcement) => {
    try {
      await toggleAnnouncementHeroFeature(item.id, !!item.featuredInHero);
      setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, featuredInHero: !a.featuredInHero } : a));
    } catch (error) {
      console.error('Error toggling hero feature:', error);
      alert('Could not update hero tag.');
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
      setFormData({ title: '', content: '', category: 'General', imageUrl: '', featuredInHero: false });
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
      imageUrl: announcement.imageUrl || '',
      featuredInHero: !!announcement.featuredInHero
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
        <button onClick={() => { setEditingId(null); setFormData({ title: '', content: '', category: 'General', imageUrl: '', featuredInHero: false }); setImagePreview(''); setIsModalOpen(true); }} className="px-6 py-3 bg-maroon text-white rounded-xl font-bold flex items-center gap-2 hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/20">
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
                    {item.featuredInHero && (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Hero Carousel
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 font-light text-sm line-clamp-2">{item.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleHero(item)}
                  className={cn(
                    "p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-bold",
                    item.featuredInHero 
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm" 
                      : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                  )}
                  title={item.featuredInHero ? "Remove from Hero Carousel" : "Tag to display on Hero Carousel"}
                >
                  <Star className={cn("h-4 w-4", item.featuredInHero && "fill-current")} />
                  <span className="hidden sm:inline text-[11px]">{item.featuredInHero ? 'Featured' : 'Hero Tag'}</span>
                </button>
                <button onClick={() => handleEdit(item)} className="p-2 text-slate-300 hover:text-maroon hover:bg-maroon/5 rounded-lg transition-all" title="Edit">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="fixed inset-0" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] z-10 my-auto">
            <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">{editingId ? 'Edit Announcement' : 'Post New Update'}</h2>
              <button
                type="button"
                onClick={() => !submitting && setIsModalOpen(false)}
                disabled={submitting}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-6 overscroll-contain">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-maroon/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                  <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-maroon/20" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>General</option>
                    <option>Service</option>
                    <option>Ministry</option>
                    <option>Emergency</option>
                  </select>
                </div>
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Feature in Hero Carousel</p>
                      <p className="text-[11px] text-slate-500">Spotlight this church news update directly on the Home Page Hero slider</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.featuredInHero}
                      onChange={e => setFormData({ ...formData, featuredInHero: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content</label>
                  <textarea required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none text-sm min-h-[150px] focus:ring-2 focus:ring-maroon/20" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Announcement Image</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {imagePreview ? (
                      <div className="relative group h-32 w-full sm:w-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
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
                      <label className="w-full sm:flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-maroon/30 transition-all cursor-pointer group bg-slate-50/50 hover:bg-slate-50">
                        <Upload className="h-6 w-6 text-slate-300 group-hover:text-maroon/50 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                      </label>
                    )}
                    <div className="w-full sm:flex-1 space-y-2">
                      <input 
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-maroon/20" 
                        placeholder="Or paste image URL..."
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      />
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest px-1">Recommended: 1200x600px</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 sm:gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button disabled={submitting} type="submit" className="flex-1 py-3.5 bg-maroon text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/20">
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {compressing ? 'Optimizing Photo...' : 'Saving...'}
                    </>
                  ) : editingId ? 'Save Changes' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
