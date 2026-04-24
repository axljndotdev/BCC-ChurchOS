import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getSystemSettings, 
  updateSystemSettings, 
  getWeeklyActivities, 
  addWeeklyActivity, 
  updateWeeklyActivity, 
  deleteWeeklyActivity,
  addEvent,
  getEvents,
  uploadFile
} from '../services/db';
import { SystemSettings, WeeklyActivity, Ministry } from '../types';
import { 
  Save, 
  Loader2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter, 
  Layout, 
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  X,
  Calendar,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Activity Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Partial<WeeklyActivity> | null>(null);

  const AVAILABLE_MINISTRIES = [
    { id: 'young-at-hearts', title: 'Young at Hearts' },
    { id: 'yah-young-adults-huddle', title: 'YAH (Young Adults Huddle)' },
    { id: 'ignite-one-youth-fellowship', title: 'Ignite One Youth Fellowship' },
    { id: 'the-exemplary-husband-sherpas', title: 'The Exemplary Husband (Sherpas)' },
    { id: 'circle-of-women', title: 'Circle of Women' },
    { id: 'superbook-kids-sbk', title: 'Superbook Kids (SBK)' },
    { id: 'harkel-music-team', title: 'Harkel (Music Team)' },
    { id: 'audio-video-av', title: 'Audio Video (AV)' }
  ];

  const seedEngageEvent = async () => {
    try {
      setSaving(true);
      await addEvent({
        title: 'Engage',
        slug: 'engage-the-great-commission',
        description: 'Join us as we explore the Great Commission and how we can engage our community and the world with the gospel.',
        content: '# Engage: The Great Commission\n\nJoin us for a powerful time of learning, inspiration, and mobilization as we explore our call to engage the world with the Good News of Jesus Christ.\n\n## Join the Movement\nOur mission is not just a suggestion; it is a command to reach every corner of the world with the message of hope. This event will feature speakers, workshops, and communal prayer focused on both local and global missions.\n\n### Sessions Include:\n- **Narrative Sessions**: Hear direct reports from the mission field.\n- **Mobilization Workshops**: Practical steps for community engagement.\n- **The Global Horizon**: Understanding our role in the Great Commission.\n\nWe look forward to seeing how God moves in our church as we say "YES" to His call.',
        date: new Date('2026-05-24T18:00:00Z'),
        location: 'Main Sanctuary',
        imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200'
      });
      alert('Engage Event created successfully! You can find it in the Event Management section to further customize its details.');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to create Engage event.');
    } finally {
      setSaving(false);
    }
  };

  const seedActivities = async () => {
    const initialActivities: Omit<WeeklyActivity, 'id'>[] = [
      { 
        day: 'Sunday', 
        time: '9:00 AM', 
        title: 'Worship Service', 
        description: 'Join us for our main corporate worship gathering.', 
        location: 'Main Sanctuary', 
        category: 'Spiritual', 
        order: 0 
      },
      { 
        day: 'Tuesday', 
        time: '6:00 PM', 
        title: 'YAH (Young Adults Huddle)', 
        description: 'Regular huddle for young adults to fellowship and grow in faith.', 
        location: 'Fellowship Hall', 
        category: 'Fellowship', 
        order: 1,
        ministryId: 'yah-young-adults-huddle' 
      },
      { 
        day: 'Wednesday', 
        time: '6:00 PM', 
        title: 'Mid-week Prayer Meeting', 
        description: 'Corporate intercession and prayer for the church and the community.', 
        location: 'Blue Room', 
        category: 'Spiritual', 
        order: 2 
      },
      { 
        day: 'Thursday', 
        time: '6:00 PM', 
        title: 'Theology Class', 
        description: 'In-depth study of Christian doctrine and the Word of God.', 
        location: 'Library', 
        category: 'Spiritual', 
        order: 3 
      },
      { 
        day: 'Friday', 
        time: '6:00 PM', 
        title: 'Ignite One Youth Fellowship', 
        description: 'Dynamic gathering for our youth to build community and encounter God.', 
        location: 'Main Sanctuary', 
        category: 'Fellowship', 
        order: 4,
        ministryId: 'ignite-one-youth-fellowship' 
      }
    ];

    try {
      setSaving(true);
      for (const activity of initialActivities) {
        await addWeeklyActivity(activity);
      }
      const updated = await getWeeklyActivities();
      setActivities(updated);
      alert('Initial activities seeded successfully!');
    } catch (error) {
      console.error('Error seeding activities:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, activitiesData] = await Promise.all([
          getSystemSettings(),
          getWeeklyActivities()
        ]);

        if (settingsData) {
          setSettings(settingsData);
        } else {
          setSettings({
            id: 'general',
            churchName: 'Bethesda Community Church (BCC)',
            tagline: 'A sanctuary for the soul and a family for the heart.',
            isLive: false,
            welcomeTitle: 'Bethesda Family',
            welcomeSubtitle: "Bethesda Community Church (BCC) is more than a building—it's a sanctuary for the soul and a family for the heart in Kabankalan City.",
            updatedBy: 'System',
            lastUpdated: new Date()
          } as SystemSettings);
        }
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity || !editingActivity.title) return;

    try {
      setSaving(true);
      if (editingActivity.id) {
        await updateWeeklyActivity(editingActivity.id, editingActivity);
      } else {
        await addWeeklyActivity({
          ...editingActivity,
          order: activities.length
        } as Omit<WeeklyActivity, 'id'>);
      }
      
      const updated = await getWeeklyActivities();
      setActivities(updated);
      setIsModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await deleteWeeklyActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccess(false);
    try {
      await updateSystemSettings({
        ...settings,
        updatedBy: user?.displayName || 'Admin'
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;

      // Hero Quality: 1920px width, 0.2MB target (Safe for Firestore Base64)
      if (file.size > 50 * 1024) {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1920,
          useWebWorker: false,
          initialQuality: 0.8,
          maxIteration: 4
        };
        fileToUpload = await imageCompression(file, options);
      }

      setCompressing(false);
      const url = await uploadFile(fileToUpload, 'settings', (progress) => {
        setUploadProgress(Math.round(progress));
      });

      if (url && settings) {
        setSettings({ ...settings, heroImageUrl: url });
      }
    } catch (error) {
      console.error('Error uploading hero image:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setCompressing(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-maroon animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Church Settings</h1>
        <p className="text-slate-500 font-light">Manage your church's public information and dashboard defaults.</p>
      </header>

      <form id="admin-settings-form" onSubmit={handleSubmit} className="space-y-8 mb-8">
        {/* Identity Section */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">General Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Church Name</label>
              <input 
                type="text" 
                name="churchName"
                value={settings?.churchName || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                placeholder="e.g. Bethesda Community Church (BCC)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Broadcast Status</label>
              <div className="flex items-center gap-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                 <button
                   type="button"
                   onClick={() => setSettings(prev => prev ? { ...prev, isLive: !prev.isLive } : null)}
                   className={cn(
                     "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-2",
                     settings?.isLive ? "bg-red-600" : "bg-slate-200"
                   )}
                 >
                   <span
                     className={cn(
                       "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                       settings?.isLive ? "translate-x-5" : "translate-x-0"
                     )}
                   />
                 </button>
                 <span className="text-sm font-medium text-slate-600">
                    {settings?.isLive ? 'Live Stream Active' : 'Off Air'}
                 </span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tagline / Mission</label>
              <input 
                type="text" 
                name="tagline"
                value={settings?.tagline || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                placeholder="A sanctuary for the soul..."
              />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <MapPin className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  type="text" 
                  name="address"
                  value={settings?.address || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  type="text" 
                  name="phone"
                  value={settings?.phone || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  type="email" 
                  name="email"
                  value={settings?.email || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section Content */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Layout className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">Hero Section (Home)</h2>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hero Banner Image</label>
              <div className="relative group aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-maroon/30 transition-all">
                {settings?.heroImageUrl ? (
                  <>
                    <img src={settings.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer px-6 py-3 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-xl">
                        Change Banner
                        <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} disabled={compressing || saving} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer">
                    <ImageIcon className="h-10 w-10 text-slate-300 mb-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                      Upload High-Res Hero Banner
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} disabled={compressing || saving} />
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">External Banner URL (Optional)</label>
                <input 
                  type="url" 
                  name="heroImageUrl"
                  value={settings?.heroImageUrl || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Welcome Title</label>
                <input 
                  type="text" 
                  name="welcomeTitle"
                  value={settings?.welcomeTitle || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all font-display"
                  placeholder="e.g. Bethesda Family"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Welcome Subtitle</label>
                <textarea 
                  name="welcomeSubtitle"
                  value={settings?.welcomeSubtitle || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Facebook className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">Social Media Links</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Facebook className="h-3 w-3" /> Facebook URL
              </label>
              <input 
                type="url" 
                name="facebookUrl"
                value={settings?.facebookUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Instagram className="h-3 w-3" /> Instagram URL
              </label>
              <input 
                type="url" 
                name="instagramUrl"
                value={settings?.instagramUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Youtube className="h-3 w-3" /> YouTube URL
              </label>
              <input 
                type="url" 
                name="youtubeUrl"
                value={settings?.youtubeUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Twitter className="h-3 w-3" /> Twitter URL
              </label>
              <input 
                type="url" 
                name="twitterUrl"
                value={settings?.twitterUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Google Maps (Share Link)
              </label>
              <input 
                type="url" 
                name="googleMapsUrl"
                value={settings?.googleMapsUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                placeholder="e.g. https://maps.app.goo.gl/..."
              />
            </div>
          </div>
        </section>
      </form>

      {/* Weekly Activities Section */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-2xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-slate-900">Weekly Activities</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={seedEngageEvent}
                className="px-4 py-2 bg-maroon/10 text-maroon rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-maroon/20 transition-all flex items-center gap-2"
              >
                <Calendar className="h-3 w-3" /> Initialize Engage Event
              </button>
              {activities.length === 0 && (
                <button 
                  type="button"
                  onClick={seedActivities}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Seed Initial Data
                </button>
              )}
              <button 
                type="button"
                onClick={() => {
                  setEditingActivity({
                    day: 'Monday',
                    category: 'Fellowship',
                    time: '',
                    title: '',
                    description: '',
                    location: ''
                  });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-maroon text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-maroon-dark transition-all"
              >
                <Plus className="h-4 w-4" /> Add Activity
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">No weekly activities added yet.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-maroon uppercase">{activity.day}</span>
                      <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                      <h3 className="text-sm font-bold text-slate-800">{activity.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{activity.time} @ {activity.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingActivity(activity);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-maroon transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Activity Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-6 font-primary">
                {editingActivity?.id ? 'Edit Activity' : 'Add New Activity'}
              </h2>
              
              <form onSubmit={handleSaveActivity} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Day</label>
                    <select 
                      value={editingActivity?.day}
                      onChange={(e) => setEditingActivity({...editingActivity!, day: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={editingActivity?.category}
                      onChange={(e) => setEditingActivity({...editingActivity!, category: e.target.value as any})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                    >
                      {['Spiritual', 'Fellowship', 'Service', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Related Ministry (Optional)</label>
                  <select 
                    value={editingActivity?.ministryId || ''}
                    onChange={(e) => setEditingActivity({...editingActivity!, ministryId: e.target.value || undefined})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                  >
                    <option value="">None / General</option>
                    {AVAILABLE_MINISTRIES.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Activity Title</label>
                  <input 
                    type="text" 
                    value={editingActivity?.title}
                    onChange={(e) => setEditingActivity({...editingActivity!, title: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                    placeholder="e.g. Mid-week Prayer"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Time</label>
                    <input 
                      type="text" 
                      value={editingActivity?.time}
                      onChange={(e) => setEditingActivity({...editingActivity!, time: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                      placeholder="e.g. 7:00 PM"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                    <input 
                      type="text" 
                      value={editingActivity?.location}
                      onChange={(e) => setEditingActivity({...editingActivity!, location: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                      placeholder="e.g. Fellowship Hall"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={editingActivity?.description}
                    onChange={(e) => setEditingActivity({...editingActivity!, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all resize-none"
                    placeholder="Brief description of the activity..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Save Activity
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="sticky bottom-8 flex justify-center pt-8 pointer-events-none">
          <button 
            type="submit"
            form="admin-settings-form"
            disabled={saving}
            className={cn(
              "px-12 py-5 rounded-full text-lg font-bold flex items-center gap-3 shadow-2xl transition-all duration-500 pointer-events-auto",
              success 
                ? "bg-emerald-500 text-white" 
                : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            {saving ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle2 className="h-6 w-6" />
                Settings Saved
              </>
            ) : (
              <>
                <Save className="h-6 w-6" />
                Save All Changes
              </>
            )}
          </button>
        </div>
    </div>
  );
}
