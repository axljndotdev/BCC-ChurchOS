import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Upload,
  X,
  ChevronLeft,
  Search,
  Filter
} from 'lucide-react';
import { 
  getGalleryItems, 
  uploadFile 
} from '../services/db';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { GalleryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';
import { cn } from '../lib/utils';

export default function AdminMedia() {
  const { user } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newImage, setNewImage] = useState({
    album: 'General',
    imageFile: null as File | null,
    previewUrl: ''
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const data = await getGalleryItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(prev => ({
        ...prev,
        imageFile: file,
        previewUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleUpload = async () => {
    if (!newImage.imageFile) return;

    setUploading(true);
    setCompressing(true);
    setUploadProgress(0);

    try {
      let fileToUpload = newImage.imageFile;

      // Higher quality for Gallery (Web Quality)
      if (fileToUpload.size > 100 * 1024) {
        const options = {
          maxSizeMB: 0.6, // High quality for gallery
          maxWidthOrHeight: 1600,
          useWebWorker: false,
          initialQuality: 0.8,
          maxIteration: 3
        };
        fileToUpload = await imageCompression(fileToUpload, options);
      }
      
      setCompressing(false);
      
      const imageUrl = await uploadFile(fileToUpload, 'gallery', (progress) => {
        setUploadProgress(Math.round(progress));
      });

      if (imageUrl && db) {
        await addDoc(collection(db, 'gallery'), {
          album: newImage.album,
          imageUrl,
          uploadedBy: user?.displayName || 'Admin',
          createdAt: serverTimestamp()
        });
        
        setShowUploadModal(false);
        setNewImage({ album: 'General', imageFile: null, previewUrl: '' });
        fetchGallery();
      }
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setCompressing(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      if (db) {
        await deleteDoc(doc(db, 'gallery', id));
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const filteredItems = items.filter(item => 
    item.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Gallery Management</h1>
          <p className="text-slate-500 font-light">Upload and organize church memories.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-maroon text-white rounded-2xl text-sm font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add To Gallery
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
            <Filter className="h-4 w-4" />
            Albums
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-maroon animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.album} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <p className="text-white font-display font-semibold">{item.album}</p>
                  <button 
                    onClick={() => handleDelete(item.id!)}
                    className="mt-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors w-fit shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !uploading && setShowUploadModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-slate-900">Add Gallery Image</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Album Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Album / Category</label>
                  <input 
                    type="text" 
                    value={newImage.album}
                    onChange={(e) => setNewImage(prev => ({ ...prev, album: e.target.value }))}
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    placeholder="e.g. Youth Camp 2024"
                  />
                </div>

                {/* Image Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Photo</label>
                  <div className="relative group aspect-video rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-maroon/30 transition-all">
                    {newImage.previewUrl ? (
                      <>
                        <img src={newImage.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer px-6 py-3 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-xl">
                            Change Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer">
                        <ImageIcon className="h-10 w-10 text-slate-300 mb-4" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                          Select Image
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                      </label>
                    )}
                    
                    {uploading && (
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

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !newImage.imageFile}
                    className="flex-[2] px-6 py-4 bg-maroon text-white rounded-2xl text-sm font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Working...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Add Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
