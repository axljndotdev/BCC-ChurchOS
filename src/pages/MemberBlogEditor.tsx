import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  addBlogPost, 
  getBlogPost, 
  updateBlogPost, 
  uploadFile 
} from '../services/db';
import { BlogPost } from '../types';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Eye,
  Type,
  FileText,
  Tag,
  User,
  History,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';

export default function MemberBlogEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [preview, setPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const initialLoadRef = useRef(true);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Ministry Reflections',
    coverImage: '',
    tags: [] as string[],
    isMe: true,
    customAuthor: ''
  });

  const getDraftKey = () => `bcc_blog_draft_${id || 'new'}_${user?.uid}`;

  // Check for local draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(getDraftKey());
    if (draft) {
      setShowRestorePrompt(true);
    }
  }, [id, user?.uid]);

  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Auto-save logic
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    setIsDirty(true);
    const timeoutId = setTimeout(() => {
      localStorage.setItem(getDraftKey(), JSON.stringify(formData));
      setLastSaved(new Date());
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const restoreDraft = () => {
    const draft = localStorage.getItem(getDraftKey());
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        setIsDirty(false);
        setShowRestorePrompt(false);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(getDraftKey());
    setShowRestorePrompt(false);
  };

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const post = await getBlogPost(id);
          if (post) {
            const isMe = post.authorId === user?.uid;
            const data = {
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              category: post.category || 'Ministry Reflections',
              coverImage: post.coverImage || '',
              tags: post.tags || [],
              isMe,
              customAuthor: isMe ? '' : post.authorName
            };
            setFormData(data);
            // Reset dirty state after initial fetch
            setTimeout(() => {
              setIsDirty(false);
              initialLoadRef.current = true; // Block the next effect run
            }, 100);
          }
        } catch (error) {
          console.error('Error fetching blog for edit:', error);
        } finally {
          setFetching(false);
        }
      };
      fetchPost();
    }
  }, [id, user?.uid]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setCompressing(true);
    setUploadProgress(0);
    console.log("Starting blog image upload:", file.name, file.size);

    try {
      let fileToUpload = file;

      // Only compress if larger than 50KB
      if (file.size > 50 * 1024) {
        console.log("Compressing blog image...");
        const options = {
          maxSizeMB: 0.2, // Safe for 1MB Firestore limit
          maxWidthOrHeight: 1600, 
          useWebWorker: false,
          initialQuality: 0.8,
          maxIteration: 4
        };
        fileToUpload = await imageCompression(file, options);
        console.log("Compression done:", fileToUpload.size);
      }

      setCompressing(false);
      console.log("Uploading blog image...");
      
      const url = await uploadFile(fileToUpload, 'blogs', (progress) => {
        setUploadProgress(Math.round(progress));
      });
      
      if (url) {
        console.log("Blog image upload success:", url);
        setFormData(prev => ({ ...prev, coverImage: url }));
      } else {
        throw new Error("No URL from upload");
      }
    } catch (error) {
      console.error('Error uploading blog image:', error);
      alert('Upload failed. Please try a different image.');
    } finally {
      console.log("Finishing blog upload process");
      setLoading(false);
      setCompressing(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (status: BlogPost['status']) => {
    if (!formData.title || !formData.content) {
      alert('Please fill in both title and content');
      return;
    }

    if (!formData.isMe && !formData.customAuthor) {
      alert('Please provide an author name');
      return;
    }

    setLoading(true);
    try {
      const authorName = formData.isMe ? (user!.displayName || 'BCC Leader') : formData.customAuthor;
      const { isMe, customAuthor, ...postData } = formData;

      if (id) {
        await updateBlogPost(id, {
          ...postData,
          authorName,
          status,
          updatedAt: new Date()
        });
      } else {
        await addBlogPost({
          ...postData,
          authorId: user!.uid,
          authorName,
          status,
        });
      }
      
      // Clear draft on successful save
      localStorage.removeItem(getDraftKey());
      setIsDirty(false);
      navigate('/member/dashboard');
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to exit? Your progress is saved locally as a draft.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-maroon animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-maroon transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-slate-900">
                {id ? 'Edit Article' : 'Compose Story'}
              </h1>
              {lastSaved && !loading && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="h-3 w-3" />
                  Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            <p className="text-slate-500 font-light italic">
              Share your heart with the church family.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setPreview(!preview)}
            className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {preview ? 'Edit Mode' : 'Live Preview'}
          </button>
          <button
            disabled={loading}
            onClick={() => handleSubmit('pending')}
            className="flex-1 sm:flex-none px-8 py-3 bg-maroon text-white rounded-2xl text-sm font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for Review
          </button>
        </div>
      </header>

      {/* Restore Draft Prompt */}
      <AnimatePresence>
        {showRestorePrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-maroon text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-maroon/20 border border-maroon-dark/10"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Unsaved draft found</h3>
                <p className="text-sm text-white/80">Would you like to restore your last session's progress?</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={restoreDraft}
                className="flex-1 md:flex-none px-6 py-3 bg-white text-maroon rounded-xl text-sm font-bold shadow-lg hover:bg-slate-100 transition-all"
              >
                Restore Progress
              </button>
              <button 
                onClick={discardDraft}
                className="flex-1 md:flex-none px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-bold hover:bg-white/20 transition-all"
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {preview ? (
        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 prose prose-slate max-w-none prose-headings:font-display">
          <div className="mb-12">
            <h1 className="text-5xl font-display font-bold text-slate-900 mb-6">{formData.title || 'Your Title Here'}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] uppercase font-bold tracking-widest">{formData.category}</span>
              <span>Draft Preview</span>
            </div>
          </div>
          {formData.coverImage && (
            <img src={formData.coverImage} alt="" className="w-full h-96 object-cover rounded-[2rem] mb-12 shadow-md" />
          )}
          <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {formData.content || 'Start writing to see your content here...'}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-xl border border-slate-100 space-y-12">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  <Type className="h-3 w-3" /> Article Title
                </label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="The Heart of Worship..."
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-maroon/20 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  <User className="h-3 w-3" /> Author
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isMe: true }))}
                    type="button"
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                      formData.isMe 
                        ? "bg-maroon text-white border-maroon shadow-md" 
                        : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    ME ({user?.displayName || 'Leader'})
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isMe: false }))}
                    type="button"
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                      !formData.isMe 
                        ? "bg-maroon text-white border-maroon shadow-md" 
                        : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    Other
                  </button>
                </div>
                {!formData.isMe && (
                  <motion.input 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    value={formData.customAuthor}
                    onChange={e => setFormData(prev => ({ ...prev, customAuthor: e.target.value }))}
                    placeholder="Enter author's name..."
                    className="w-full px-6 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 transition-all mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  <FileText className="h-3 w-3" /> Short Excerpt
                </label>
                <textarea 
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="A brief summary for the list view..."
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm h-24 resize-none focus:ring-2 focus:ring-maroon/20 transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    <Tag className="h-3 w-3" /> Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20"
                  >
                    <option>Ministry Reflections</option>
                    <option>Sermon Insights</option>
                    <option>Personal Testimony</option>
                    <option>Community News</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Slug (Auto)
                  </label>
                  <div className="px-4 py-3 bg-slate-100 rounded-xl text-[10px] font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                    {formData.slug || 'generating-slug...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Placeholder */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cover Image</label>
                <div className="relative group aspect-video rounded-[2.5rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-maroon/30 transition-all">
                  {formData.coverImage ? (
                    <>
                      <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer px-6 py-3 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-xl">
                          Change Image
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer">
                      <ImageIcon className="h-10 w-10 text-slate-300 mb-4" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                        Upload Cover Image
                      </span>
                      <span className="text-[10px] text-slate-300 mt-2 text-center">Recommended: 1600px High Quality</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                  {loading && (
                     <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 z-10">
                       <Loader2 className="h-8 w-8 text-maroon animate-spin mb-3" />
                       <span className="text-[10px] font-bold text-maroon uppercase tracking-widest text-center leading-tight">
                         {compressing ? 'Optimizing Quality...' : `Uploading: ${uploadProgress}%`}
                       </span>
                       <div className="w-32 h-1 bg-maroon/10 rounded-full mt-3 overflow-hidden">
                         <motion.div 
                           className="h-full bg-maroon transition-all duration-300"
                           initial={{ width: 0 }}
                           animate={{ width: compressing ? '20%' : `${uploadProgress}%` }}
                         />
                       </div>
                     </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Or Use External Image URL</label>
                <input 
                  type="url"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={e => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-2 pt-8 border-t border-slate-50">
            <div className="flex items-center justify-between ml-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Main Story
              </label>
              <p className="text-[10px] text-slate-300 italic">Supports Markdown formatting</p>
            </div>
            <textarea 
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="In the beginning..."
              className="w-full px-8 py-10 bg-slate-50 border-none rounded-[3rem] text-slate-700 min-h-[500px] focus:ring-2 focus:ring-maroon/10 outline-none transition-all shadow-inner leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Warning/Info */}
      <div className="bg-blue-50 p-6 rounded-3xl flex gap-4 border border-blue-100">
        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Publication Note</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Your story will be submitted to the Church Council for review. Once approved, it will be published to the public-facing blog. Ensure your content reflects the values and heart of BCC.
          </p>
        </div>
      </div>
    </div>
  );
}
