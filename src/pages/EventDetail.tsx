import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEvent, updateEvent, uploadFile, deleteEvent } from '../services/db';
import { ChurchEvent } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  Trash2,
  Loader2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { formatDate, slugify } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import LoadingSpinner from '../components/LoadingSpinner';
import imageCompression from 'browser-image-compression';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, isCouncil, profile } = useAuth();
  
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editedEvent, setEditedEvent] = useState<Partial<ChurchEvent>>({});

  const canEdit = isSuperAdmin || isAdmin || isCouncil;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const data = await getEvent(id);
        if (data) {
          setEvent(data);
          setEditedEvent(data);
        } else {
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;

      // Event Quality: 1600px, 0.2MB (Safe for Firestore Base64)
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
        setEditedEvent(prev => ({ ...prev, imageUrl: url }));
      }
    } catch (error) {
      console.error('Error uploading event image:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setCompressing(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!id || !event) return;
    setSaving(true);
    try {
      await updateEvent(event.id, editedEvent);
      const updatedEvent = { ...event, ...editedEvent } as ChurchEvent;
      setEvent(updatedEvent);
      setIsEditing(false);
      
      // If slug changed, update URL
      if (editedEvent.slug && editedEvent.slug !== id) {
        navigate(`/events/${editedEvent.slug}`, { replace: true });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !event) return;
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    setSaving(true);
    try {
      await deleteEvent(event.id);
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. You might not have permission.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
            <Link 
              to="/events" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
              Back to Events
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight"
            >
              {event.title}
            </motion.h1>

            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-maroon" />
                <span className="font-medium">
                  {(() => {
                    const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                    return isNaN(d.getTime()) ? 'Date TBA' : formatDate(event.date);
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-maroon" />
                <span className="font-medium">
                  {(() => {
                    const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                    return isNaN(d.getTime()) ? 'TBA' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-maroon" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900">About the Event</h2>
              {canEdit && !isEditing && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl font-bold shadow-sm border border-slate-100 hover:text-maroon transition-all"
                  >
                    <Edit2 className="h-4 w-4" /> Edit Details
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-400 rounded-xl font-bold shadow-sm border border-slate-100 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Title</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 font-display font-bold"
                    value={editedEvent.title || ''}
                    onChange={e => setEditedEvent({ ...editedEvent, title: e.target.value, slug: slugify(e.target.value) })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cover Image</label>
                    <div className="relative group aspect-video rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-maroon/30 transition-all">
                      {editedEvent.imageUrl ? (
                        <>
                          <img src={editedEvent.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer px-6 py-3 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-xl">
                              Change Image
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={compressing || saving} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer">
                          <ImageIcon className="h-10 w-10 text-slate-300 mb-4" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                            Upload Event Image
                          </span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={compressing || saving} />
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
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                      value={editedEvent.imageUrl || ''}
                      onChange={e => setEditedEvent({ ...editedEvent, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                      value={editedEvent.date ? new Date(editedEvent.date.toDate ? editedEvent.date.toDate() : editedEvent.date).toISOString().split('T')[0] : ''}
                      onChange={e => {
                        const d = editedEvent.date ? (editedEvent.date.toDate ? editedEvent.date.toDate() : new Date(editedEvent.date)) : new Date();
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        d.setFullYear(year);
                        d.setMonth(month - 1);
                        d.setDate(day);
                        setEditedEvent({ ...editedEvent, date: d });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                      value={editedEvent.date ? new Date(editedEvent.date.toDate ? editedEvent.date.toDate() : editedEvent.date).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }) : '09:00'}
                      onChange={e => {
                        const d = editedEvent.date ? (editedEvent.date.toDate ? editedEvent.date.toDate() : new Date(editedEvent.date)) : new Date();
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        d.setHours(hours);
                        d.setMinutes(minutes);
                        setEditedEvent({ ...editedEvent, date: d });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                    value={editedEvent.location || ''}
                    onChange={e => setEditedEvent({ ...editedEvent, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Short Description</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 min-h-[80px]"
                    value={editedEvent.description || ''}
                    onChange={e => setEditedEvent({ ...editedEvent, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Content (Markdown)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 min-h-[300px] font-mono"
                    placeholder="Describe the event in detail..."
                    value={editedEvent.content || ''}
                    onChange={e => setEditedEvent({ ...editedEvent, content: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-colors shadow-lg shadow-maroon/20 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
                {event.content ? (
                  <article className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-light">
                    <ReactMarkdown>{event.content}</ReactMarkdown>
                  </article>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 italic">No detailed content available for this event yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
