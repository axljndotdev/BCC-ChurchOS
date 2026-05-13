import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, addEvent, uploadFile, deleteEvent, getEventsByYear } from '../services/db';
import { ChurchEvent } from '../types';
import { Calendar, Plus, Trash2, Edit2, Search, MapPin, Clock, Loader2, Image as ImageIcon, Upload, AlertCircle, Video, X, Link as LinkIcon } from 'lucide-react';
import { formatDate, slugify, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import imageCompression from 'browser-image-compression';
import { EventMedia } from '../types';

export default function AdminEvents() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    imageUrl: '',
    media: [] as EventMedia[]
  });

  const [mediaInput, setMediaInput] = useState({
    url: '',
    type: 'photo' as 'photo' | 'video',
    caption: '',
    thumbnail: '',
    thumbnailFile: null as File | null,
    thumbnailPreview: ''
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEventsByYear(selectedYear);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedYear]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;

      // Quality settings for events: 1600px width, 0.2MB target (Safe for Firestore Base64)
      if (file.size > 50 * 1024) {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1600,
          useWebWorker: false,
          initialQuality: 0.8,
          maxIteration: 4
        };
        fileToUpload = await imageCompression(file, options);
      }

      setCompressing(false);
      const url = await uploadFile(fileToUpload, 'events', (progress) => {
        setUploadProgress(Math.round(progress));
      });

      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
      }
    } catch (error) {
      console.error('Error uploading event image:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setCompressing(false);
      setUploadProgress(0);
    }
  };

  const addMediaItem = () => {
    if (!mediaInput.url) return;
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, { 
        type: mediaInput.type,
        url: mediaInput.url,
        caption: mediaInput.caption,
        thumbnail: mediaInput.thumbnail || mediaInput.thumbnailPreview
      }]
    }));
    setMediaInput({ url: '', type: 'photo', caption: '', thumbnail: '', thumbnailFile: null, thumbnailPreview: '' });
  };

  const removeMediaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      let fileToUpload = file;
      if (file.size > 100 * 1024) {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: false };
        fileToUpload = await imageCompression(file, options);
      }
      const url = await uploadFile(fileToUpload, 'events/gallery');
      if (url) {
        setMediaInput(prev => ({ ...prev, url, type: 'photo' }));
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Media upload failed.');
    } finally {
      setCompressing(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      let fileToUpload = file;
      const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: false };
      fileToUpload = await imageCompression(file, options);
      const url = await uploadFile(fileToUpload, 'events/thumbnails');
      if (url) {
        setMediaInput(prev => ({ ...prev, thumbnail: url, thumbnailPreview: url }));
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const eventDate = new Date(`${formData.date}T${formData.time}`);

      await addEvent({
        title: formData.title,
        slug: slugify(formData.title),
        description: formData.description,
        content: formData.content,
        location: formData.location,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
        date: eventDate,
        media: formData.media
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        imageUrl: '',
        media: []
      });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      alert('Invalid event ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this event? This action is permanent.')) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to delete event:', id);
      await deleteEvent(id);
      console.log('Delete successful, refreshing list...');
      await fetchEvents();
      alert('Event deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting event:', err);
      const message = err.message || JSON.stringify(err);
      setError(`Failed to delete event: ${message}`);
      alert(`Failed to delete event. ${message}`);
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Event Management</h1>
          <p className="text-slate-500">Schedule and manage church-wide events.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-maroon text-white rounded-xl font-bold hover:bg-maroon-dark transition-all scale-100 hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" /> Schedule Event
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter events..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-maroon/20 cursor-pointer"
            >
              {[new Date().getFullYear() + 1, new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Location</th>
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
              ) : filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        {event.imageUrl ? (
                          <img 
                            src={event.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{event.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="font-medium">
                      {(() => {
                        const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                        return isNaN(d.getTime()) ? 'Invalid Date' : formatDate(event.date);
                      })()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(() => {
                        const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                        return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      })()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/events/${event.slug || event.id}`}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-light italic">
                    No scheduled events found.
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
              <h2 className="text-2xl font-display font-bold text-slate-900">Schedule Event</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Title</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Time</label>
                  <input 
                    required
                    type="time"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cover Image</label>
                    <div className="relative group aspect-video rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-maroon/30 transition-all">
                      {formData.imageUrl ? (
                        <>
                          <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer px-6 py-3 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-xl">
                              Change Image
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={compressing || submitting} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer">
                          <ImageIcon className="h-10 w-10 text-slate-300 mb-4" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                            Upload Event Image
                          </span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={compressing || submitting} />
                        </label>
                      )}
                      
                      {(compressing || uploadProgress > 0) && (
                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 z-10">
                          <Loader2 className="h-8 w-8 text-maroon animate-spin mb-3" />
                          <span className="text-[10px] font-bold text-maroon uppercase tracking-widest text-center">
                            {compressing ? 'Optimizing Quality...' : `Uploading: ${uploadProgress}%`}
                          </span>
                          <div className="w-32 h-1 bg-maroon/10 rounded-full mt-3 overflow-hidden">
                            <motion.div 
                              className="h-full bg-maroon transition-all duration-300"
                              initial={{ width: 0 }}
                              animate={{ width: compressing ? '30%' : `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or Use External Image URL</label>
                    <input 
                      type="url"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Media Gallery</label>
                  </div>
                  
                  {formData.media.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.media.map((item, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                          {item.type === 'photo' ? (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full relative group">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2">
                                  <Video className="h-6 w-6 mb-1 opacity-50" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          )}
                          <button 
                            type="button"
                            onClick={() => removeMediaItem(idx)}
                            className="absolute top-2 right-2 p-1 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaInput({ ...mediaInput, type: 'photo' })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                          mediaInput.type === 'photo' ? "bg-white shadow-sm text-maroon" : "text-slate-400"
                        )}
                      >
                        Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaInput({ ...mediaInput, type: 'video' })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                          mediaInput.type === 'video' ? "bg-white shadow-sm text-maroon" : "text-slate-400"
                        )}
                      >
                        Video URL
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {mediaInput.type === 'photo' ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-maroon/20"
                            placeholder={mediaInput.url ? "File ready to add" : "Paste image URL or upload..."}
                            value={mediaInput.url}
                            onChange={e => setMediaInput({ ...mediaInput, url: e.target.value })}
                          />
                          {!mediaInput.url && (
                            <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all">
                              <Upload className="h-4 w-4 text-slate-400" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleMediaFileUpload} disabled={compressing} />
                            </label>
                          )}
                          {mediaInput.url && (
                            <button onClick={() => setMediaInput({...mediaInput, url: ''})} className="px-2 text-red-400 hover:text-red-600">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <input 
                          className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-maroon/20"
                          placeholder="Paste Video URL (YouTube/Vimeo)..."
                          value={mediaInput.url}
                          onChange={e => setMediaInput({ ...mediaInput, url: e.target.value })}
                        />
                      )}
                      <button
                        type="button"
                        onClick={addMediaItem}
                        disabled={!mediaInput.url}
                        className="px-4 py-2 bg-maroon text-white rounded-xl text-xs font-bold disabled:opacity-30 transition-all"
                      >
                        Add to Gallery
                      </button>
                    </div>
                    {mediaInput.url && (
                      <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-100">
                        {mediaInput.type === 'video' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Video Thumbnail</label>
                            <div className="flex gap-2">
                              <input 
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] outline-none focus:ring-1 focus:ring-maroon/20"
                                placeholder="Thumbnail URL (optional)..."
                                value={mediaInput.thumbnail}
                                onChange={e => setMediaInput({ ...mediaInput, thumbnail: e.target.value })}
                              />
                              <label className="cursor-pointer px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all shrink-0">
                                <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} disabled={compressing} />
                              </label>
                            </div>
                            {mediaInput.thumbnailPreview && (
                              <img src={mediaInput.thumbnailPreview} alt="" className="h-12 aspect-video object-cover rounded-lg border border-slate-100" />
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Caption</label>
                          <input 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-maroon/20"
                            placeholder="Add a caption (optional)..."
                            value={mediaInput.caption}
                            onChange={e => setMediaInput({ ...mediaInput, caption: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Short Description</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none min-h-[80px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Event Details (Markdown)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none min-h-[150px] font-mono"
                    placeholder="Describe the event in detail..."
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
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
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
