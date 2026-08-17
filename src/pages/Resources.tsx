import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Lock, Unlock, Download, ChevronRight, FileText, 
  Calendar, CheckCircle, ArrowRight, BookMarked, Eye,
  Plus, Trash2, Edit, X, FileUp, Globe, Info, HelpCircle, Loader2, Sparkles, AlertTriangle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  getResources, 
  addResource, 
  updateResource, 
  deleteResource, 
  incrementDownloadCount,
  uploadFile 
} from '../services/db';
import { ResourceItem } from '../types';

interface ManualChapter {
  title: string;
  subtitle: string;
  summary: string;
  verses: string[];
}

export default function Resources() {
  const { user, profile, isCouncil, isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [isManualExpanded, setIsManualExpanded] = useState<boolean>(false);
  const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({});
  
  // Dynamic Resources State
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'public' | 'members'>('public');
  const [type, setType] = useState('PDF Document');
  const [sourceType, setSourceType] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [size, setSize] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const chapters: ManualChapter[] = [
    {
      title: "1. ONE PROMISE: Assurance of Salvation",
      subtitle: "Knowing and walking in the security of your eternal redemption",
      summary: "Discover the biblical truth of salvation through Jesus Christ. Learn how to stand firm on God's unwavering promises, overcoming doubts with the secure knowledge that your relationship with the Father is sealed by grace.",
      verses: ["1 John 5:11-13", "John 10:28-29", "Ephesians 1:13-14"]
    },
    {
      title: "2. ONE PROOF: Our New Life in Christ",
      subtitle: "The tangible transformation of a regenerated believer",
      summary: "Understanding the immediate and continuous changes that occur when we are born again. This lesson explores the spiritual transformation of our desires, habits, speech, and priorities as we reflect our new identity.",
      verses: ["2 Corinthians 5:17", "Galatians 2:20", "Romans 6:4"]
    },
    {
      title: "3. ONE WAY: The Savior",
      subtitle: "Jesus Christ, the exclusive path to reconciliation with God",
      summary: "An in-depth look at the unique person, sinless life, sacrificial death, and bodily resurrection of Jesus Christ. Examine why He is the only mediator between a holy God and sinful humanity.",
      verses: ["John 14:6", "Acts 4:12", "1 Timothy 2:5"]
    },
    {
      title: "4. ONE BASIS: The Bible",
      subtitle: "The inspired, inerrant, and final authority for faith and life",
      summary: "Unpack how God revealed Himself through the written Scriptures. Learn practical methods of reading, studying, and applying God's Word as the final anchor for your thoughts and actions.",
      verses: ["2 Timothy 3:16-17", "Hebrews 4:12", "Psalm 119:9-11"]
    },
    {
      title: "5. ONE SOURCE: The Holy Spirit",
      subtitle: "The Counselor, Comforter, and source of spiritual power",
      summary: "Explore the ministry of the Holy Spirit in the believer's life. Learn how to be filled with, guided by, and empowered by the Spirit to bear godly fruit and exercise spiritual gifts.",
      verses: ["John 14:26", "Acts 1:8", "Galatians 5:22-23"]
    },
    {
      title: "6. ONE STEP: Baptism Part I",
      subtitle: "Understanding the biblical meaning and command of water baptism",
      summary: "Why must believers be baptized? Explore the rich symbolism of water baptism as an outward expression of an inward reality—our death, burial, and resurrection with Jesus.",
      verses: ["Matthew 28:19", "Romans 6:3-4", "Acts 2:38"]
    },
    {
      title: "7. ONE STEP: Baptism Part II",
      subtitle: "The practical commitment and public witness of baptism",
      summary: "Prepare your heart for the sacrament of water baptism. This lesson guides you through sharing your testimony and aligning your public profession with a lifestyle of obedience.",
      verses: ["Acts 8:36-38", "1 Peter 3:21", "Mark 16:16"]
    },
    {
      title: "8. ONE FAMILY: Church I",
      subtitle: "The universal body and local expression of Christ's church",
      summary: "Discover God's design for the church as a spiritual family. Learn why local assembly, mutual care, and elder leadership are essential for healthy spiritual development.",
      verses: ["Ephesians 2:19-22", "Hebrews 10:24-25", "Acts 2:42-47"]
    },
    {
      title: "9. ONE FAMILY: Church II",
      subtitle: "Living out your covenant membership and responsibilities",
      summary: "Understand the privileges and duties of church membership. Explore your role in serving, giving, protecting church unity, and supporting the vision of your local assembly.",
      verses: ["1 Corinthians 12:12-27", "Ephesians 4:1-3", "Hebrews 13:17"]
    },
    {
      title: "10. ONE PURSUIT: Growing in our Relationship with Christ",
      subtitle: "The ongoing journey of progressive sanctification",
      summary: "Nurture your daily walk with God through spiritual disciplines. This study provides tools for daily quiet time, prayer, fasting, and continuous fellowship with the Lord.",
      verses: ["Colossians 2:6-7", "2 Peter 3:18", "Philippians 3:12-14"]
    },
    {
      title: "11. ONE TASK: Witnessing",
      subtitle: "Proclaiming the Gospel to a searching world",
      summary: "Every believer is called to be a witness. Learn how to share your testimony naturally, overcome fear of rejection, and articulate the Gospel clearly with love and respect.",
      verses: ["Acts 1:8", "1 Peter 3:15", "Mark 16:15"]
    },
    {
      title: "12. ONE GOAL: In Making Disciples",
      subtitle: "Spiritual multiplication and fulfilling the Great Commission",
      summary: "The ultimate objective of discipleship is to make disciples who make disciples. Discover the tools and heart needed to mentor others and invest spiritually in the next generation.",
      verses: ["Matthew 28:18-20", "2 Timothy 2:2", "John 15:8"]
    }
  ];

  // Load Resources from Firestore
  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await getResources(!!user);
      setResources(data);
    } catch (err) {
      console.error("Error loading resources:", err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [user, isCouncil]);

  // Format File Size
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // File Upload Handler (converts to Base64 safely)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be under 2MB to ensure robust database transfer.' });
      return;
    }

    setUploadProgress(15);
    setFileName(file.name);
    setSize(formatBytes(file.size));

    // Guess document type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') setType('PDF Document');
    else if (ext === 'docx' || ext === 'doc') setType('DOCX Document');
    else if (ext === 'xlsx' || ext === 'xls') setType('Spreadsheet');
    else if (ext === 'mp3' || ext === 'wav' || ext === 'm4a') setType('Audio Guide');
    else if (ext === 'mp4' || ext === 'mov') setType('Video Guide');
    else if (ext === 'jpg' || ext === 'png' || ext === 'gif') setType('Image Resource');
    else setType('Document File');

    try {
      const base64 = await uploadFile(file, `resources/${file.name}`, (p) => {
        setUploadProgress(p);
      });
      setUrl(base64);
      setMessage({ type: 'success', text: `File "${file.name}" ready for upload!` });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to process the uploaded file. Please try a smaller file.' });
    } finally {
      setUploadProgress(null);
    }
  };

  // Form Reset
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('public');
    setType('PDF Document');
    setSourceType('upload');
    setUrl('');
    setFileName('');
    setSize('');
    setEditingResource(null);
  };

  // Open Add Modal
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (resource: ResourceItem) => {
    setEditingResource(resource);
    setTitle(resource.title);
    setDescription(resource.description);
    setCategory(resource.category);
    setType(resource.type);
    setSourceType(resource.url.startsWith('data:') ? 'upload' : 'url');
    setUrl(resource.url);
    setFileName(resource.fileName || '');
    setSize(resource.size || '');
    setShowModal(true);
  };

  // Handle Resource Form Submit (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !url) {
      setMessage({ type: 'error', text: 'Please fill in all required fields and upload a file or input a URL.' });
      return;
    }

    setIsActionLoading(true);
    setMessage(null);

    try {
      if (editingResource) {
        // Edit Mode
        await updateResource(editingResource.id, {
          title,
          description,
          category,
          type,
          url,
          fileName: fileName || null,
          size: size || null,
        });
        setMessage({ type: 'success', text: 'Resource updated successfully!' });
      } else {
        // Add Mode
        await addResource({
          title,
          description,
          category,
          type,
          url,
          fileName: fileName || null,
          size: size || null,
          uploadedBy: profile?.uid || 'anonymous',
          uploadedByName: profile?.displayName || 'Church Council'
        });
        setMessage({ type: 'success', text: 'Resource added successfully!' });
      }
      setShowModal(false);
      resetForm();
      loadResources();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'An error occurred while saving the resource.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Resource Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resource permanently?")) return;

    setIsActionLoading(true);
    try {
      await deleteResource(id);
      setMessage({ type: 'success', text: 'Resource deleted successfully.' });
      loadResources();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete the resource.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Toggle Publish (category between public and members)
  const handleTogglePublish = async (id: string, currentCategory: 'public' | 'members') => {
    setIsActionLoading(true);
    const newCategory = currentCategory === 'public' ? 'members' : 'public';
    try {
      await updateResource(id, { category: newCategory });
      setMessage({ 
        type: 'success', 
        text: newCategory === 'public' 
          ? 'Resource successfully published to the Public Library!' 
          : 'Resource restricted to Members-Only.' 
      });
      loadResources();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update resource status.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Download / Access Trigger
  const handleDownload = async (resource: ResourceItem) => {
    try {
      if (resource.id && !resource.id.startsWith('seed-')) {
        await incrementDownloadCount(resource.id);
      }
    } catch (e) {
      console.warn("Could not increment download count:", e);
    }

    if (resource.url.startsWith('data:')) {
      // Clean base64 download
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.fileName || `${resource.title.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // External redirect
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadLesson = (ch: ManualChapter) => {
    const content = `BETHESDA COMMUNITY CHURCH (BCC)
DISCIPLESHIP JOURNEY MANUAL: LESSON WORKSHEET
-----------------------------------------------
Lesson: ${ch.title}
Focus: ${ch.subtitle}
-----------------------------------------------

SUMMARY & ESSENCE:
${ch.summary}

KEY SCRIPTURES & DEVOTIONAL READING:
${ch.verses.map(v => `- ${v}`).join('\n')}

REFLECTIVE DISCUSSION QUESTIONS (LIFE GROUP WORKSHEET):
1. In what ways does this lesson challenge or reshape your current perspective of your walk with Christ?
2. Read the key scriptures above. How do these verses directly apply to your daily struggles or decisions this week?
3. What is one practical step of active obedience you can take in response to this truth?

-----------------------------------------------
Copyright © 2026 Bethesda Community Church (BCC). All rights reserved.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ch.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadManualStatic = () => {
    // Generate text manual summary dynamically
    const chaptersText = chapters.map((ch, idx) => {
      return `${idx + 1}. ${ch.title.toUpperCase()}
   - Focus: ${ch.subtitle}
   - Key Verses: ${ch.verses.join(', ')}
   - Summary: ${ch.summary}
`;
    }).join('\n');

    const content = `BETHESDA COMMUNITY CHURCH (BCC)
DISCIPLESHIP JOURNEY MANUAL - 1ST LEG (PREVIEW)
-----------------------------------------------
Prepared for: ${profile?.displayName || 'Official Member'}
Date: ${new Date().toLocaleDateString()}
Status: Restricted Access Confirmed

This manual is for the exclusive spiritual training of Bethesda Community Church members.

TABLE OF CONTENTS & OUTLINE

${chaptersText}
-----------------------------------------------
Copyright © 2026 Bethesda Community Church (BCC). All rights reserved.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BCC-Discipleship-Journey-Manual.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Group Dynamic Resources
  const publicDynamicList = resources.filter(r => r.category === 'public');
  const membersDynamicList = resources.filter(r => r.category === 'members');

  const showPrivilegedControls = isCouncil || isSuperAdmin || isAdmin;

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1920" 
            alt="Resources background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/50" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-maroon/20 text-red-300 border border-maroon/30 rounded-full text-xs font-semibold mb-4 tracking-wider uppercase"
          >
            <Sparkles className="h-3 w-3" /> BCC Spiritual Library
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Equipping and <span className="italic font-light text-slate-300">Resources</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Access spiritual growth manuals, weekly bulletins, and dynamic church study guides to ground your daily life in Christ.
          </motion.p>

          {/* Super Admin & Council Control Banner */}
          {showPrivilegedControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10"
            >
              <div className="text-left text-xs">
                <p className="font-bold text-white">Privileged Controls Active</p>
                <p className="text-slate-300 font-light text-[10px]">Add, edit, or delete dynamic downloads and links.</p>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-maroon text-white hover:bg-white hover:text-slate-900 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-maroon/20"
              >
                <Plus className="h-4 w-4" /> Add Resource
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Message feedback */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
              : 'bg-red-50 text-red-800 border-red-100'
          }`}>
            <Info className="h-5 w-5 shrink-0" />
            <p className="font-medium">{message.text}</p>
            <button className="ml-auto text-slate-400 hover:text-slate-900" onClick={() => setMessage(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Discipleship Journey Manual & Members-Only Resources */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Static Discipleship Journey Manual Card */}
          <div 
            id="discipleship-manual-card" 
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12 relative overflow-hidden transition-all duration-300"
          >
            {!isManualExpanded ? (
              /* Collapsed Teaser State */
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-maroon/5 rounded-2xl text-maroon shrink-0">
                    <BookMarked className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-maroon uppercase tracking-widest bg-maroon/5 px-2.5 py-1 rounded-full">
                      {user ? "Full Access Granted" : "Preview only - Needs Login for full access"}
                    </span>
                    <h2 className="text-xl md:text-2xl font-display font-semibold text-slate-900 mt-1">Discipleship Journey Manual</h2>
                  </div>
                </div>
                
                <p className="text-slate-600 font-light text-sm leading-relaxed">
                  The <strong className="font-semibold text-slate-900">BCC Discipleship Journey Manual</strong> is a foundational training program crafted to guide believers from the basic foundations of faith into strong, multiplication-focused spiritual maturity. Designed for use in one-on-one mentoring or Life Groups.
                </p>

                <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">
                    Foundational Lessons • Previews & Worksheets Available
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualExpanded(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-maroon text-white hover:bg-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-maroon/10"
                  >
                    Expand Lessons <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Expanded Full Content State */
              <div className="space-y-8">
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-maroon/5 rounded-2xl text-maroon">
                      <BookMarked className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-maroon uppercase tracking-widest bg-maroon/5 px-2.5 py-1 rounded-full">
                        {user ? "Full Access Granted" : "Preview only - Needs Login for full access"}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-display font-semibold text-slate-900 mt-1">Discipleship Journey Manual</h2>
                    </div>
                  </div>

                  {user ? (
                    <button 
                      onClick={handleDownloadManualStatic}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-maroon transition-colors shadow-lg shadow-slate-900/10"
                    >
                      <Download className="h-4 w-4" /> Download Outline
                    </button>
                  ) : (
                    <Link 
                      to="/login?redirect=/resources"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 hover:text-slate-950 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                      <Lock className="h-4 w-4" /> Sign In to Download
                    </Link>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-slate-600 font-light leading-relaxed">
                    The <strong className="font-semibold text-slate-900">BCC Discipleship Journey Manual</strong> is a foundational training program crafted to guide believers from the basic foundations of faith into strong, multiplication-focused spiritual maturity. Designed for use in one-on-one mentoring or Life Groups.
                  </p>
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                    <Info className="h-5 w-5 text-maroon shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 font-light leading-relaxed">
                      <span className="font-bold text-slate-900">Preview Mode Active:</span> Anyone can expand and explore the basic lesson previews, summaries, and key scriptures below. Official members can download personalized outlines and full interactive worksheets.
                    </div>
                  </div>
                </div>

                {/* Active chapters list (Visible to Everyone) */}
                <div className="space-y-4">
                  {user && (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
                      <Unlock className="h-4 w-4 text-emerald-600" /> Access Granted • Welcome, {profile?.displayName || 'Member'}!
                    </div>
                  )}

                  <div className="border-l-4 border-maroon pl-4 py-1.5 mb-4 bg-slate-50/50 rounded-r-xl pr-4">
                    <span className="text-[10px] font-bold text-maroon uppercase tracking-widest block">Current Track</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-0.5">Study Series Leg 1 - The Basics</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {chapters.map((ch, idx) => (
                      <div 
                        key={idx} 
                        className="border border-slate-100 rounded-2xl overflow-hidden transition-all bg-slate-50/20"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveChapter(activeChapter === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{ch.title}</p>
                            <p className="text-xs text-slate-500 font-light mt-0.5">{ch.subtitle}</p>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeChapter === idx ? 'rotate-90 text-maroon' : ''}`} />
                        </button>

                        {activeChapter === idx && (
                          <div className="p-6 bg-white border-t border-slate-50 space-y-4 text-sm font-light text-slate-600 leading-relaxed">
                            <div>
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lesson Focus & Overview</h5>
                              <p className="text-slate-600 font-light">{ch.summary}</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-50">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Key Scriptures:</span>
                              {ch.verses.map((v, i) => (
                                <span key={i} className="text-xs font-medium text-maroon bg-maroon/5 px-2.5 py-1 rounded-full">
                                  {v}
                                </span>
                              ))}
                            </div>

                            {/* Interactive Downloader/Lock Notice inside expanded chapter */}
                            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {user ? (
                                <>
                                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Full worksheet available for download
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadLesson(ch)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-maroon text-white hover:bg-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                                  >
                                    <Download className="h-3.5 w-3.5" /> Download Lesson Worksheet
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5 text-amber-500" /> Printable lesson guides are reserved for covenant members
                                  </span>
                                  <Link
                                    to="/login?redirect=/resources"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-maroon/5 hover:bg-maroon hover:text-white text-maroon rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-maroon/10 text-center"
                                  >
                                    Log In to Unlock
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collapse Button at the bottom */}
                <div className="flex justify-center pt-8 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualExpanded(false);
                      const element = document.getElementById('discipleship-manual-card');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Collapse Manual <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Members-Only Dynamic Downloads */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-display font-semibold text-slate-900">Members-Only Material</h3>
                <p className="text-xs text-slate-400 font-light mt-1">Exclusive documents and guides for active covenant partners.</p>
              </div>
              <Unlock className="h-5 w-5 text-emerald-600 shrink-0" />
            </div>

            <div className="w-12 h-px bg-slate-200 mb-8" />

            {!user ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center">
                <Lock className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">Protected Library Section</h4>
                <p className="text-xs text-slate-500 font-light max-w-xs mx-auto mt-1 mb-4">
                  Please log in to view and download our exclusive ministry resources and church directories.
                </p>
                <Link to="/login?redirect=/resources" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-maroon hover:text-slate-900 transition-colors">
                  Log In Now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-maroon" />
                <p className="text-xs">Loading member resources...</p>
              </div>
            ) : membersDynamicList.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-100 rounded-2xl">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-light">No additional members-only resources available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {membersDynamicList.map((res) => (
                  <div 
                    key={res.id} 
                    className="p-6 border border-slate-100 rounded-2xl hover:border-maroon/10 hover:shadow-md transition-all group flex flex-col justify-between bg-white"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="p-2.5 bg-slate-50 group-hover:bg-maroon/5 text-slate-400 group-hover:text-maroon rounded-xl transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        
                        {showPrivilegedControls && (
                          <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleTogglePublish(res.id, res.category)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                              title="Publish to Public Library"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Publish</span>
                            </button>
                            <button 
                              onClick={() => openEditModal(res)}
                              className="p-1.5 hover:text-maroon text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(res.id)}
                              className="p-1.5 hover:text-red-600 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-maroon transition-colors">{res.title}</h4>
                      <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">{res.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{res.type} {res.size ? `• ${res.size}` : ''}</span>
                      <button 
                        onClick={() => handleDownload(res)}
                        className="text-maroon hover:text-slate-900 font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                      >
                        Access <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Public Library */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <div>
              <h3 className="text-xl font-display font-semibold text-slate-900">Public Library</h3>
              <p className="text-xs text-slate-400 font-light mt-1">Available for download by all visitors and guests.</p>
            </div>

            <div className="w-12 h-px bg-slate-200" />

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-maroon" />
                <p className="text-xs">Loading public library...</p>
              </div>
            ) : publicDynamicList.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-100 rounded-2xl">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-light">The public library is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publicDynamicList.map((res) => (
                  <div 
                    key={res.id} 
                    className="p-5 border border-slate-100 rounded-2xl hover:border-maroon/10 hover:shadow-md transition-all group relative bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="p-2.5 bg-slate-50 group-hover:bg-maroon/5 text-slate-400 group-hover:text-maroon rounded-xl transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      
                      {showPrivilegedControls ? (
                        <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleTogglePublish(res.id, res.category)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                            title="Make Members-Only (Restrict Access)"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Restrict</span>
                          </button>
                          <button 
                            onClick={() => openEditModal(res)}
                            className="p-1.5 hover:text-maroon text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(res.id)}
                            className="p-1.5 hover:text-red-600 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Public
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-maroon transition-colors">{res.title}</h4>
                    <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">{res.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{res.type} {res.size ? `• ${res.size}` : ''}</span>
                      <button 
                        onClick={() => handleDownload(res)}
                        className="text-maroon hover:text-slate-900 font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                      >
                        Download <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connect Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
            </div>
            <div className="relative z-10 space-y-4">
              <span className="text-[9px] font-bold text-maroon uppercase tracking-widest bg-maroon/25 px-2.5 py-1 rounded-full border border-maroon/40">Need Guidance?</span>
              <h4 className="text-2xl font-display font-semibold">Join a Life Group</h4>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Connect with an experienced mentor or discipleship lead to walk alongside you in studying the manual chapters.
              </p>
              <Link 
                to="/ministries" 
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-slate-300 transition-colors pt-2 group"
              >
                Explore Ministries <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Slide-over Form Dialog / Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] z-10 my-auto"
            >
              {/* Modal Header */}
              <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-display font-semibold text-slate-900">
                    {editingResource ? 'Edit Church Resource' : 'Add New Church Resource'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-light">Provide downloadable file or dynamic link for the community.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0 overscroll-contain">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resource Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Bulletin - July 12"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-maroon focus:border-maroon"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Short Description *</label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief outline or purpose of this material..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-maroon focus:border-maroon"
                  />
                </div>

                {/* Row: Category & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as 'public' | 'members')}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-maroon focus:border-maroon bg-white"
                    >
                      <option value="public">Public Library</option>
                      <option value="members">Members-Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Format/Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-maroon focus:border-maroon bg-white"
                    >
                      <option value="PDF Document">PDF Document</option>
                      <option value="DOCX Document">DOCX Document</option>
                      <option value="Spreadsheet">Spreadsheet</option>
                      <option value="Audio Guide">Audio Guide</option>
                      <option value="Video Guide">Video Guide</option>
                      <option value="Book/Ebook">Book / Ebook</option>
                      <option value="Web Link">Web Link</option>
                      <option value="Other File">Other File</option>
                    </select>
                  </div>
                </div>

                {/* Source Selection Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resource Source</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSourceType('upload')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-colors ${sourceType === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceType('url')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-colors ${sourceType === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      External URL / Link
                    </button>
                  </div>
                </div>

                {/* File Upload Box */}
                {sourceType === 'upload' ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50">
                    <FileUp className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="text-xs text-slate-500">
                      <label className="cursor-pointer font-bold text-maroon hover:underline">
                        Select a file to upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp3,.wav,.mp4,.png,.jpg"
                        />
                      </label>
                      <p className="mt-1 font-light text-[10px]">PDF, Word, Excel, Audio, Text up to 2MB</p>
                    </div>

                    {fileName && (
                      <div className="p-3 bg-white rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
                        <p className="font-bold text-slate-800 truncate">{fileName}</p>
                        <p className="text-[10px] text-slate-400 font-light">Size: {size}</p>
                      </div>
                    )}

                    {uploadProgress !== null && (
                      <div className="space-y-1">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-maroon transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">Uploading: {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">External URL *</label>
                      <input
                        type="url"
                        required={sourceType === 'url'}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-maroon focus:border-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Custom Size/Label (Optional)</label>
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="e.g. 5 MB or Link"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-maroon focus:border-maroon"
                      />
                    </div>
                  </div>
                )}
                </div>

                {/* Submit & Cancel */}
                <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading || (sourceType === 'upload' && !url)}
                    className="px-6 py-2.5 bg-maroon disabled:bg-slate-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-900 transition-colors inline-flex items-center gap-1.5"
                  >
                    {isActionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {editingResource ? 'Update' : 'Publish Resource'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
