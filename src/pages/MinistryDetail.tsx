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
  Send
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { 
  getMinistryDetails, 
  submitMinistryEdit, 
  updateMinistryDetails,
  requestMinistryEditorAccess 
} from '../services/db';
import { MinistryDetail as IMinistryDetail, Ministry } from '../types';
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
        // Direct update
        await updateMinistryDetails(id, {
          ...editData,
          updatedBy: profile.displayName
        });
        setMessage({ type: 'success', text: 'Ministry details updated successfully!' });
        await fetchMinistry();
        setIsEditing(false);
      } else if (profile.isMinistryEditor) {
        // Submit for review
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
      </div>
    );
  }

  const isPrivileged = isSuperAdmin || isAdmin || isCouncil;

  if (!ministry && !isEditing) {
    if (isPrivileged) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-6">Ministry Page Not Found</h1>
          <p className="text-slate-600 mb-8">This ministry page hasn't been created yet. Would you like to create it?</p>
          <button 
            onClick={() => {
              setEditData({ name: id as any, description: '', content: '' });
              setIsEditing(true);
            }}
            className="px-8 py-3 bg-maroon text-white rounded-full font-bold hover:bg-maroon-dark transition-all"
          >
            Create Page
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-display font-bold mb-6">Ministry Page Not Found</h1>
        <Link to="/ministries" className="text-maroon font-bold flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Ministries
        </Link>
      </div>
    );
  }

  const canEdit = isPrivileged || (profile && profile.isMinistryEditor);
  const canRequest = profile && profile.membershipStatus === 'official_member' && !profile.isMinistryEditor && !isPrivileged;

  return (
    <div className="pb-20">
      {/* Header */}
      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src={editData.imageUrl || ministry?.imageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920"} 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to="/ministries" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Ministries
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight"
              >
                {isEditing ? (
                  <input 
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value as any })}
                    className="bg-transparent border-b border-white/30 focus:border-white outline-none w-full"
                    placeholder="Ministry Name"
                  />
                ) : (
                  ministry?.name
                )}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-300 font-light leading-relaxed"
              >
                {isEditing ? (
                  <textarea 
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="bg-transparent border-b border-white/30 focus:border-white outline-none w-full resize-none"
                    placeholder="Short description..."
                    rows={2}
                  />
                ) : (
                  ministry?.description
                )}
              </motion.p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-white text-maroon rounded-full font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : <><Save className="h-4 w-4" /> {!isPrivileged ? 'Submit for Review' : 'Save Changes'}</>}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-white text-maroon rounded-full font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl"
                    >
                      <Edit3 className="h-4 w-4" /> Edit Page
                    </button>
                  )}
                  {canRequest && (
                    <button 
                      onClick={handleRequestAccess}
                      disabled={requestingAccess}
                      className="px-6 py-3 bg-maroon text-white rounded-full font-bold hover:bg-maroon-dark transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4" /> {requestingAccess ? 'Requesting...' : 'Request Editor Access'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={cn(
            "mb-8 p-4 rounded-2xl flex items-center gap-3",
            message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          )}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Content Area */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Page Content (Markdown)</h3>
                  <textarea 
                    value={editData.content || ''}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    className="w-full h-[500px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all font-mono text-sm"
                    placeholder="# Welcome to our ministry..."
                  />
                </div>
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Preview</h3>
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{editData.content || ''}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-maroon prose-img:rounded-3xl">
                  <ReactMarkdown>{ministry?.content || ''}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Details</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-maroon/5 text-maroon">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Meeting Time</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editData.meetingTime || ''}
                        onChange={(e) => setEditData({ ...editData, meetingTime: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm"
                        placeholder="Sundays at 9:00 AM"
                      />
                    ) : (
                      <p className="text-slate-700">{ministry?.meetingTime || 'TBA'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-maroon/5 text-maroon">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm"
                        placeholder="Main Sanctuary"
                      />
                    ) : (
                      <p className="text-slate-700">{ministry?.location || 'TBA'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-maroon/5 text-maroon">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Leader</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editData.leader || ''}
                        onChange={(e) => setEditData({ ...editData, leader: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm"
                        placeholder="Name of leader"
                      />
                    ) : (
                      <p className="text-slate-700">{ministry?.leader || 'TBA'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Media</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Header Image URL</label>
                    <input 
                      type="text"
                      value={editData.imageUrl || ''}
                      onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                <h3 className="text-xl font-display font-bold mb-4">Get Involved</h3>
                <p className="text-slate-400 text-sm font-light mb-6">
                  Interested in joining this ministry or have questions? Send us a message and we'll connect you with the leaders.
                </p>
                <Link 
                  to="/contact" 
                  className="w-full py-4 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-all flex items-center justify-center gap-2"
                >
                  Contact Us <Send className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
