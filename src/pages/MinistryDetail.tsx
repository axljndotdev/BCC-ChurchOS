import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  Send,
  Calendar,
  Sparkles,
  Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { 
  getMinistryDetails, 
  submitMinistryEdit, 
  updateMinistryDetails,
  requestMinistryEditorAccess 
} from '../services/db';
import { MinistryDetail as IMinistryDetail } from '../types';
import { cn } from '../lib/utils';

export default function MinistryDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isSuperAdmin, isAdmin, isCouncil } = useAuth();
  const navigate = useNavigate();
  
  const [ministry, setMinistry] = useState<IMinistryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<IMinistryDetail>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [requestingAccess, setRequestingAccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMinistry();
    }
  }, [id]);

  const fetchMinistry = async () => {
    try {
      const data = await getMinistryDetails(id!);
      if (data) {
        setMinistry(data);
        setEditData(data);
      }
    } catch (error) {
      console.error('Error fetching ministry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !user || !profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const isPrivileged = isSuperAdmin || isAdmin || isCouncil;
      
      if (isPrivileged) {
        await updateMinistryDetails(id, {
          ...editData,
          updatedBy: profile.displayName
        });
        setMessage({ type: 'success', text: 'Ministry details updated successfully!' });
        await fetchMinistry();
        setIsEditing(false);
      } else if (profile.isMinistryEditor) {
        await submitMinistryEdit({
          ministryId: id,
          content: editData.content || '',
          description: editData.description || '',
          imageUrl: editData.imageUrl,
          meetingTime: editData.meetingTime,
          location: editData.location,
          submittedBy: user.uid,
          submittedByName: profile.displayName
        });
        setMessage({ type: 'success', text: 'Your edits have been submitted for review by the Superadmin.' });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving ministry:', error);
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!id || !user || !profile) return;
    setRequestingAccess(true);
    try {
      await requestMinistryEditorAccess(user.uid, profile.displayName, user.email || '', id);
      setMessage({ type: 'success', text: 'Your request for editor access has been sent to the Superadmin.' });
    } catch (error) {
      console.error('Error requesting access:', error);
      setMessage({ type: 'error', text: 'Failed to send request. Please try again.' });
    } finally {
      setRequestingAccess(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7A121D]"></div>
      </div>
    );
  }

  const isPrivileged = isSuperAdmin || isAdmin || isCouncil;

  if (!ministry && !isEditing) {
    if (isPrivileged) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center bg-[#FAF7F2]">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">Ministry Page Not Found</h1>
          <p className="text-slate-600 mb-8">This ministry page hasn't been set up yet. Would you like to create it?</p>
          <button 
            onClick={() => {
              setEditData({ name: id as any, description: '', content: '' });
              setIsEditing(true);
            }}
            className="px-8 py-3.5 bg-[#7A121D] text-white rounded-full font-bold hover:bg-[#5C0612] transition-all text-xs uppercase tracking-wider"
          >
            Create Page
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center bg-[#FAF7F2]">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">Ministry Page Not Found</h1>
        <Link to="/ministries" className="text-[#7A121D] font-bold flex items-center justify-center gap-2 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Ministries
        </Link>
      </div>
    );
  }

  const canEdit = isPrivileged || (profile && profile.isMinistryEditor);
  const canRequest = profile && profile.membershipStatus === 'official_member' && !profile.isMinistryEditor && !isPrivileged;

  return (
    <div className="pb-24 sm:pb-32 bg-[#FAF7F2] min-h-screen">
      {/* Header - Matching 📋 Ministry Single.png */}
      <section className="relative pt-16 sm:pt-20 pb-16 sm:pb-24 bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] border-b border-[#C99738]/30 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src={editData.imageUrl || ministry?.imageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920"} 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb back link */}
          <Link to="/ministries" className="inline-flex items-center gap-2 text-stone-300 hover:text-white mb-6 transition-colors text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4 text-[#C99738]" /> Back to All Ministries
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 border border-[#C99738]/40 rounded-full text-[#F0CA7D] text-[10px] font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3 h-3 text-[#E5B869]" />
                <span>Bethesda Ministry</span>
              </div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white mb-4 tracking-tight leading-tight"
              >
                {isEditing ? (
                  <input 
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value as any })}
                    className="bg-transparent border-b border-white/30 focus:border-[#E5B869] outline-none w-full text-white"
                    placeholder="Ministry Name"
                  />
                ) : (
                  ministry?.name
                )}
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-stone-300 font-light text-sm sm:text-base leading-relaxed"
              >
                {isEditing ? (
                  <textarea 
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="bg-transparent border-b border-white/30 focus:border-[#E5B869] outline-none w-full resize-none text-white text-sm"
                    placeholder="Short description..."
                    rows={2}
                  />
                ) : (
                  <p>{ministry?.description}</p>
                )}
              </motion.div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-[#E5B869] text-[#3D040A] rounded-full font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : <><Save className="h-4 w-4" /> {!isPrivileged ? 'Submit for Review' : 'Save Changes'}</>}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white/10 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-white text-[#7A121D] rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#FAF6EE] transition-all flex items-center gap-2 shadow-xl border border-[#E8D5B5]"
                    >
                      <Edit3 className="h-4 w-4" /> Edit Page
                    </button>
                  )}
                  {canRequest && (
                    <button 
                      onClick={handleRequestAccess}
                      disabled={requestingAccess}
                      className="px-6 py-3 bg-[#7A121D] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#5C0612] transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#E5B869]" /> {requestingAccess ? 'Requesting...' : 'Request Editor Access'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout (2-Column Matching 📋 Ministry Single.png) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {message && (
          <div className={cn(
            "mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm",
            message.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          )}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Left Column (Markdown & Ministry Overview) */}
          <div className="lg:col-span-8 space-y-8">
            {isEditing ? (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D5B5]">
                  <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">
                    Ministry Details & Overview (Markdown)
                  </h3>
                  <textarea 
                    value={editData.content || ''}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    className="w-full h-[450px] p-4 bg-[#FDFBF7] border border-[#E8D5B5] rounded-2xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] outline-none transition-all font-mono text-xs text-slate-800"
                    placeholder="# Welcome to our ministry..."
                  />
                </div>
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8D5B5]">
                  <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Live Markdown Preview</h3>
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{editData.content || ''}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-[#E8D5B5]">
                <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base prose-strong:text-[#7A121D] prose-blockquote:border-l-4 prose-blockquote:border-[#C99738] prose-blockquote:bg-[#FAF6EE] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-img:rounded-2xl">
                  {ministry?.content ? (
                    <ReactMarkdown>{ministry.content}</ReactMarkdown>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">About This Ministry</h2>
                      <p className="text-slate-700 leading-relaxed mb-6">
                        {ministry?.description || "Welcome to our ministry group. Here at Bethesda Community Church, we are passionate about growing deeper in our relationship with Jesus Christ and walking side by side as brothers and sisters in faith."}
                      </p>
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-3">What to Expect</h3>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        When you join our gatherings, you will find warm hospitality, Christ-centered fellowship, biblically grounded teachings, and opportunities to build lasting friendships.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ministry Quick Info & Leader Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8D5B5] space-y-6">
              <h3 className="text-lg font-display font-bold text-slate-900 pb-4 border-b border-[#E8D5B5]/60 flex items-center justify-between">
                <span>Gathering Details</span>
                <span className="text-xs font-serif text-[#C99738]">✦</span>
              </h3>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] shrink-0">
                    <Clock className="h-4 w-4 text-[#C99738]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Meeting Schedule</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editData.meetingTime || ''}
                        onChange={(e) => setEditData({ ...editData, meetingTime: e.target.value })}
                        className="w-full bg-[#FDFBF7] border border-[#E8D5B5] rounded-lg px-3 py-1.5 text-xs text-slate-900"
                        placeholder="Sundays at 8:45 AM"
                      />
                    ) : (
                      <p className="text-slate-800 font-semibold">{ministry?.meetingTime || 'Sundays & Weekly'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] shrink-0">
                    <MapPin className="h-4 w-4 text-[#C99738]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full bg-[#FDFBF7] border border-[#E8D5B5] rounded-lg px-3 py-1.5 text-xs text-slate-900"
                        placeholder="Main Sanctuary"
                      />
                    ) : (
                      <p className="text-slate-800 font-semibold">{ministry?.location || 'BCC Sanctuary, Kabankalan'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] shrink-0">
                    <User className="h-4 w-4 text-[#C99738]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Ministry Leader</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editData.leader || ''}
                        onChange={(e) => setEditData({ ...editData, leader: e.target.value })}
                        className="w-full bg-[#FDFBF7] border border-[#E8D5B5] rounded-lg px-3 py-1.5 text-xs text-slate-900"
                        placeholder="Name of leader"
                      />
                    ) : (
                      <p className="text-slate-800 font-semibold">{ministry?.leader || 'Pastoral Ministry Team'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Get Connected Action Card */}
            {!isEditing && (
              <div className="bg-gradient-to-br from-[#5C0612] to-[#3D040A] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-[#C99738]/40 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0CA7D] block">
                  Join & Connect
                </span>
                <h4 className="text-xl font-display font-bold">Interested in Joining?</h4>
                <p className="text-stone-300 text-xs leading-relaxed font-light">
                  Whether you want to participate or volunteer your spiritual gifts, our ministry leaders are here to welcome you.
                </p>
                <Link 
                  to="/contact" 
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Connect with Leaders</span>
                  <Send className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
