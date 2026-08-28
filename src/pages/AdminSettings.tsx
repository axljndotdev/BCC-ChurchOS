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
  uploadFile
} from '../services/db';
import { SystemSettings, WeeklyActivity } from '../types';
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
  Upload,
  Shield,
  ShieldCheck,
  Quote,
  Sparkles,
  Layers,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { compressImageToDataUrl } from '../lib/imageUtils';

export default function AdminSettings() {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'content' | 'schedule' | 'contact' | 'security'>('images');
  
  // Image Upload state per field
  const [compressingField, setCompressingField] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Save Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
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

  const SITE_IMAGES_CONFIG = [
    {
      key: 'heroImageUrl',
      title: 'Home Hero Banner',
      description: 'Main visual banner displayed across the full-screen hero on the home page.',
      defaultUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920',
      aspect: '21/9'
    },
    {
      key: 'givingBannerUrl',
      title: 'Giving & Stewardship Banner',
      description: 'Header image on the /give page showing our culture of cheerful generosity.',
      defaultUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920',
      aspect: '16/9'
    },
    {
      key: 'aboutStoryImageUrl',
      title: 'About Story & Vision Banner',
      description: 'Top banner on the /about page welcoming visitors to our history and mission.',
      defaultUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1920',
      aspect: '16/9'
    },
    {
      key: 'kidsMinistryImageUrl',
      title: 'BCC Kids Ministry Image',
      description: 'Visual showcase card for children ministry on the home and ministries pages.',
      defaultUrl: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800',
      aspect: '4/5'
    },
    {
      key: 'youthMinistryImageUrl',
      title: 'Youth Collective Image',
      description: 'Visual showcase card for Ignite Youth Fellowship and campus outreach.',
      defaultUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
      aspect: '4/5'
    },
    {
      key: 'communityMinistryImageUrl',
      title: 'Community Groups Image',
      description: 'Visual showcase card for Life Together and home fellowship groups.',
      defaultUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      aspect: '4/5'
    }
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
            pastorQuote: "We grow together in the Lord.",
            pastorQuoteAuthor: "Pastor Fritz",
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

  // Called when user clicks "Save All Changes" -> Prompts confirmation modal
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // Confirmed save execution
  const executeSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    setSuccess(false);
    try {
      await updateSystemSettings({
        ...settings,
        updatedBy: user?.displayName || user?.email || 'Super Admin'
      });
      setSuccess(true);
      setShowConfirmModal(false);
      setTimeout(() => setSuccess(false), 3500);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      const msg = error?.message || '';
      if (msg.includes('exceeds the maximum allowed size')) {
        alert('Images are too large for database storage. They have been automatically downscaled. Please try saving again.');
      } else {
        alert('Failed to save settings: ' + (error?.message || 'Please check permissions or network connection.'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGenericImageUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingField(key);
    setUploadProgress(25);

    try {
      setUploadProgress(60);
      const url = await compressImageToDataUrl(file, {
        maxDimension: 1200,
        targetMaxSizeBytes: 45 * 1024,
        initialQuality: 0.65
      });
      setUploadProgress(100);

      if (url && settings) {
        setSettings({ ...settings, [key]: url });
      }
    } catch (error) {
      console.error(`Error uploading ${key}:`, error);
      alert('Upload failed. Please try a different image format (JPEG, PNG, WebP).');
    } finally {
      setTimeout(() => {
        setCompressingField(null);
        setUploadProgress(0);
      }, 300);
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
    <div className="max-w-5xl mx-auto pb-24">
      {/* Super Admin Control Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-maroon/10 border border-maroon/20 rounded-full text-[10px] font-bold text-maroon uppercase tracking-widest mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Super Admin Control Suite
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
              Site Control & Settings
            </h1>
            <p className="text-slate-500 font-light text-sm mt-1">
              Directly customize all church images, page content, quotes, schedules, and live streams.
            </p>
          </div>

          {/* Security Inactivity Status */}
          <div className="flex items-center gap-2 p-3 bg-slate-900 text-white rounded-2xl shrink-0 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="font-bold text-[11px] leading-tight">2-Min Auto-Lock</p>
              <p className="text-[9px] text-slate-400 font-light">Movement-Protected</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-6 border-b border-slate-200 scrollbar-none">
          {[
            { id: 'images', label: 'Master Images', icon: ImageIcon },
            { id: 'content', label: 'Church Content & Quotes', icon: Layout },
            { id: 'schedule', label: 'Service Times & Activities', icon: Clock },
            { id: 'contact', label: 'Contact & Broadcast', icon: Globe },
            { id: 'security', label: 'Security & Auto-Lock', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0",
                  isActive 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <form id="admin-settings-form" onSubmit={handleSaveClick} className="space-y-8">
        
        {/* ==================== TAB 1: MASTER IMAGES ==================== */}
        {activeTab === 'images' && (
          <div className="space-y-8">
            <div className="bg-amber-50/80 border border-amber-200/70 p-6 rounded-[2rem] flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-amber-900 text-base">Super Admin Image Controls</h3>
                <p className="text-amber-800/80 text-xs sm:text-sm font-light mt-1 leading-relaxed">
                  You have full authority to upload, replace, or customize every image across Bethesda Community Church. Uploading a high-resolution photo automatically optimizes and prepares it for lightning-fast loading on all visitor devices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {SITE_IMAGES_CONFIG.map((imgConfig) => {
                const currentVal = (settings as any)?.[imgConfig.key] || imgConfig.defaultUrl;
                const isUploading = compressingField === imgConfig.key;

                return (
                  <div key={imgConfig.key} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-maroon uppercase tracking-widest">{imgConfig.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-md font-mono text-slate-500">{imgConfig.aspect}</span>
                      </div>
                      <p className="text-slate-500 font-light text-xs mb-4">{imgConfig.description}</p>

                      {/* Image Preview & Upload Container */}
                      <div className="relative group rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[16/9] mb-4">
                        <img 
                          src={currentVal} 
                          alt={imgConfig.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                          <label className="cursor-pointer px-4 py-2 bg-white text-slate-900 hover:bg-maroon hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl transition-colors flex items-center gap-1.5">
                            <Upload className="h-3.5 w-3.5" /> Upload File
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleGenericImageUpload(imgConfig.key, e)} 
                              disabled={saving || isUploading} 
                            />
                          </label>
                          {((settings as any)?.[imgConfig.key] && (settings as any)?.[imgConfig.key] !== imgConfig.defaultUrl) && (
                            <button
                              type="button"
                              onClick={() => setSettings(prev => prev ? { ...prev, [imgConfig.key]: imgConfig.defaultUrl } : null)}
                              className="p-2 bg-white/90 text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition-colors"
                              title="Reset to default"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Uploading Spinner */}
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 z-10">
                            <Loader2 className="h-7 w-7 text-maroon animate-spin mb-2" />
                            <span className="text-[10px] font-bold text-maroon uppercase tracking-widest text-center">
                              {uploadProgress > 0 ? `Uploading: ${uploadProgress}%` : 'Optimizing Quality...'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Direct URL input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          Direct Image URL
                        </label>
                        <input 
                          type="url" 
                          name={imgConfig.key}
                          value={(settings as any)?.[imgConfig.key] || ''}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                          placeholder={imgConfig.defaultUrl}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CHURCH CONTENT & QUOTES ==================== */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* Identity Section */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Church Identity</h2>
                  <p className="text-xs text-slate-400">Core titles, mission taglines, and public naming.</p>
                </div>
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

            {/* Welcome & Pastor Quote Content */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-maroon/10 text-maroon rounded-2xl">
                  <Quote className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Headlines & Quotes</h2>
                  <p className="text-xs text-slate-400">Customize the home page hero headlines and pastoral quote.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hero Title</label>
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Pastor Quote Attribution</label>
                  <input 
                    type="text" 
                    name="pastorQuoteAuthor"
                    value={settings?.pastorQuoteAuthor || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                    placeholder="e.g. Pastor Fritz"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Inspirational Pastoral Quote</label>
                  <input 
                    type="text" 
                    name="pastorQuote"
                    value={settings?.pastorQuote || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all italic font-display"
                    placeholder="e.g. We grow together in the Lord."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hero Welcome Subtitle</label>
                  <textarea 
                    name="welcomeSubtitle"
                    value={settings?.welcomeSubtitle || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all resize-none"
                    placeholder="Bethesda Community Church (BCC) is more than a building..."
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB 3: SERVICE TIMES & ACTIVITIES ==================== */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Weekly Activities Section */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 rounded-2xl">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-slate-900">Weekly Activities & Prayer</h2>
                    <p className="text-xs text-slate-400">Wednesday Night is at 6:00 PM; Sunday is at 9:00 AM.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={seedEngageEvent}
                    className="px-3.5 py-2 bg-maroon/10 text-maroon rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-maroon/20 transition-all flex items-center gap-1.5"
                  >
                    <Calendar className="h-3 w-3" /> Initialize Engage
                  </button>
                  {activities.length === 0 && (
                    <button 
                      type="button"
                      onClick={seedActivities}
                      className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Seed Defaults
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingActivity({
                        day: 'Wednesday',
                        category: 'Spiritual',
                        time: '6:00 PM',
                        title: 'Mid-week Prayer Meeting',
                        description: 'Corporate intercession and prayer for the church and the community.',
                        location: 'Blue Room'
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-maroon text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-maroon-dark transition-all"
                  >
                    <Plus className="h-4 w-4" /> Add Activity
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">No weekly activities added yet.</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-2xl border border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-maroon uppercase">{activity.day}</span>
                          <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                          <h3 className="text-sm font-bold text-slate-800">{activity.title}</h3>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-200/80 rounded text-slate-600 font-medium">{activity.category}</span>
                        </div>
                        <p className="text-xs text-slate-500">{activity.time} &bull; {activity.location}</p>
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
          </div>
        )}

        {/* ==================== TAB 4: CONTACT & BROADCAST ==================== */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            {/* Live Stream & Broadcast */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Broadcast & Live Stream</h2>
                  <p className="text-xs text-slate-400">Toggle active broadcast alert banners and configure live stream endpoints.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Live Status</label>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => prev ? { ...prev, isLive: !prev.isLive } : null)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
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
                    <span className="text-sm font-medium text-slate-700">
                      {settings?.isLive ? 'Live Stream Active (Header Alert On)' : 'Off Air'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Facebook Live / Video Stream URL</label>
                  <input 
                    type="url" 
                    name="facebookLiveUrl"
                    value={settings?.facebookLiveUrl || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Contact Details</h2>
                  <p className="text-xs text-slate-400">Physical address, phone numbers, and inquiry email.</p>
                </div>
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
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Google Maps Share Link</label>
                  <input 
                    type="url" 
                    name="googleMapsUrl"
                    value={settings?.googleMapsUrl || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Facebook className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Social Media Connections</h2>
                  <p className="text-xs text-slate-400">Official church community channels.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Facebook className="h-3.5 w-3.5" /> Facebook Page URL
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5" /> Instagram URL
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Youtube className="h-3.5 w-3.5" /> YouTube Channel URL
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Twitter className="h-3.5 w-3.5" /> Twitter / X URL
                  </label>
                  <input 
                    type="url" 
                    name="twitterUrl"
                    value={settings?.twitterUrl || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB 5: SECURITY & AUTO-LOCK ==================== */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Inactivity Security & Auto-Lock</h2>
                  <p className="text-xs text-slate-400">Strict safety timeout protects church administration.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Active Inactivity Timeout Duration</h3>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      The system automatically monitors mouse movement, typing, clicks, and touches. If no action is detected for <strong>2 minutes</strong>, the session pauses into lock mode.
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full font-mono font-bold text-xs">
                    2 Minutes (Active)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Protection State</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active System-wide
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detection Sensors</p>
                    <p className="text-sm font-bold text-slate-900">Pointer, Touch & Keys</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Super Admin User</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email || 'Active'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Sticky Action Footer */}
        <div className="sticky bottom-6 flex items-center justify-between p-4 bg-white/95 backdrop-blur-md rounded-[2rem] border border-slate-200 shadow-2xl z-40">
          <div className="hidden sm:flex items-center gap-2 pl-4">
            <span className="text-xs text-slate-400">Logged in as:</span>
            <span className="text-xs font-bold text-slate-800">{user?.displayName || user?.email}</span>
            <span className="px-2 py-0.5 bg-maroon/10 text-maroon text-[10px] font-bold uppercase rounded-md">
              {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Council'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
              type="submit"
              disabled={saving}
              className={cn(
                "px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all duration-300 w-full sm:w-auto",
                success 
                  ? "bg-emerald-600 text-white" 
                  : "bg-maroon text-white hover:bg-maroon-dark shadow-maroon/20"
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save & Apply Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ==================== SAVE CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 sm:p-10 border border-slate-100 relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-3xl bg-maroon/10 text-maroon flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">
                Confirm Changes
              </h3>
              <p className="text-slate-600 font-light text-sm leading-relaxed mb-6">
                Are you sure you want to apply and publish these updates to Bethesda Community Church? All visitors and members will immediately see the updated content and images.
              </p>

              {/* Summary Badges */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2 mb-8">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Changes Included in this save:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700">Master Images</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700">Church Identity & Quotes</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700">Schedule & Contact</span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700">Broadcast Feeds</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={saving}
                  className="w-full py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Cancel & Review
                </button>
                <button
                  type="button"
                  onClick={executeSaveSettings}
                  disabled={saving}
                  className="w-full py-3.5 px-6 bg-maroon hover:bg-maroon-dark text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-maroon/20 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Confirm & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== ACTIVITY MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="fixed inset-0" onClick={() => !saving && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] z-10 my-auto">
            <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 font-primary">
                {editingActivity?.id ? 'Edit Activity' : 'Add New Activity'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveActivity} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-4 overscroll-contain">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Day</label>
                    <select 
                      value={editingActivity?.day}
                      onChange={(e) => setEditingActivity({...editingActivity!, day: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                    placeholder="e.g. Mid-week Prayer"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Time</label>
                    <input 
                      type="text" 
                      value={editingActivity?.time}
                      onChange={(e) => setEditingActivity({...editingActivity!, time: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
                      placeholder="e.g. 6:00 PM"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                    <input 
                      type="text" 
                      value={editingActivity?.location}
                      onChange={(e) => setEditingActivity({...editingActivity!, location: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all resize-none"
                    placeholder="Brief description of the activity..."
                  />
                </div>
              </div>

              <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 sm:gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 bg-maroon text-white rounded-xl sm:rounded-2xl font-bold hover:bg-maroon-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-maroon/20"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
