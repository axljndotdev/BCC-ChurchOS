import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Image as ImageIcon, Trash2, Loader2, Upload, X, ChevronLeft, Search, Filter, Palette, FolderPlus, Folder, Edit, Layers, Star } from 'lucide-react';
import { useCanva } from '../hooks/useCanva';
import { 
  getGalleryItems, 
  uploadFile,
  getGalleryAlbums,
  addGalleryAlbum,
  deleteGalleryAlbum,
  addGalleryItem,
  deleteGalleryItem
} from '../services/db';
import { GalleryItem, GalleryAlbum } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function AdminMedia() {
  const { user } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'albums'>('photos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newImage, setNewImage] = useState({
    albumId: '',
    imageFiles: [] as File[],
    previews: [] as string[]
  });

  const [newAlbum, setNewAlbum] = useState({
    name: '',
    description: '',
    coverImageFile: null as File | null,
    previewUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsData, albumsData] = await Promise.all([
        getGalleryItems(),
        getGalleryAlbums()
      ]);
      setItems(itemsData);
      setAlbums(albumsData);
      if (albumsData.length > 0 && !newImage.albumId) {
        setNewImage(prev => ({ ...prev, albumId: albumsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (files.length > 20) {
        alert('You can only upload up to 20 photos at once.');
        return;
      }

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setNewImage(prev => ({
        ...prev,
        imageFiles: files,
        previews: newPreviews
      }));
    }
  };

  const handleAlbumCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAlbum(prev => ({
        ...prev,
        coverImageFile: file,
        previewUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbum.name.trim()) return;

    setUploading(true);
    try {
      let coverImageUrl = newAlbum.previewUrl && !newAlbum.coverImageFile ? newAlbum.previewUrl : '';
      
      if (newAlbum.coverImageFile) {
        coverImageUrl = await uploadFile(newAlbum.coverImageFile, 'albums');
      }

      const { updateGalleryAlbum, addGalleryAlbum } = await import('../services/db');

      if (editingAlbumId) {
        await updateGalleryAlbum(editingAlbumId, {
          name: newAlbum.name,
          description: newAlbum.description,
          coverImageUrl: coverImageUrl || undefined
        });
      } else {
        await addGalleryAlbum({
          name: newAlbum.name,
          description: newAlbum.description,
          coverImageUrl,
          isFeatured: newAlbum.name.toLowerCase().includes('bcc building') // Default feature if BCC Building
        });
      }

      setShowAlbumModal(false);
      setEditingAlbumId(null);
      setNewAlbum({ name: '', description: '', coverImageFile: null, previewUrl: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving album:', error);
      alert('Failed to save album.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleFeatured = async (album: GalleryAlbum) => {
    try {
      const { updateGalleryAlbum } = await import('../services/db');
      await updateGalleryAlbum(album.id, { isFeatured: !album.isFeatured });
      setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, isFeatured: !a.isFeatured } : a));
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleUpload = async () => {
    if (newImage.imageFiles.length === 0 || !newImage.albumId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = newImage.imageFiles.length;
      const selectedAlbum = albums.find(a => a.id === newImage.albumId);
      
      for (let i = 0; i < totalFiles; i++) {
        setCompressing(true);
        let fileToUpload = newImage.imageFiles[i];

        if (fileToUpload.size > 100 * 1024) {
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 1600,
            useWebWorker: false,
            initialQuality: 0.8,
            maxIteration: 3
          };
          fileToUpload = await imageCompression(fileToUpload, options);
        }
        
        setCompressing(false);
        
        const imageUrl = await uploadFile(fileToUpload, 'gallery', (progress) => {
          // Individual file progress, but we show overall progress for the batch
          const overallProgress = ((i / totalFiles) * 100) + ((progress / totalFiles));
          setUploadProgress(Math.round(overallProgress));
        });

        if (imageUrl) {
          await addGalleryItem({
            albumId: newImage.albumId,
            album: selectedAlbum?.name || 'Unknown',
            imageUrl,
            uploadedBy: user?.displayName || 'Admin'
          });
        }
      }
      
      setShowUploadModal(false);
      setNewImage(prev => ({ ...prev, imageFiles: [], previews: [] }));
      fetchData();
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setCompressing(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      await deleteGalleryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    const albumPhotos = items.filter(i => i.albumId === id);
    if (albumPhotos.length > 0) {
      alert('Cannot delete album that contains photos. Please delete all photos in this album first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this album?')) return;
    try {
      await deleteGalleryAlbum(id);
      setAlbums(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  const filteredItems = items.filter(item => 
    item.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { openCanva, hasKey } = useCanva();
  
  const handleCanvaDesign = () => {
    if (!newImage.albumId) {
      alert('Please select or create an album first.');
      return;
    }
    openCanva('PhotoCollage', async (url) => {
      const selectedAlbum = albums.find(a => a.id === newImage.albumId);
      await addGalleryItem({
        albumId: newImage.albumId,
        album: selectedAlbum?.name || 'Canva Designs',
        imageUrl: url,
        uploadedBy: user?.displayName || 'Admin'
      });
      fetchData();
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Gallery Management</h1>
          <p className="text-slate-500 font-light">Upload and organize church memories into albums.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleCanvaDesign}
            className={cn(
              "px-6 py-3 bg-white text-slate-700 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2",
              (!hasKey || albums.length === 0) && "opacity-50 cursor-help"
            )}
            disabled={!hasKey || albums.length === 0}
            title={!hasKey ? "Configure Canva API key to enable" : albums.length === 0 ? "Create an album first" : "Design a collage with Canva"}
          >
            <Palette className="h-4 w-4 text-blue-600" />
            Canva
          </button>
          <button 
            onClick={() => setShowAlbumModal(true)}
            className="px-6 py-3 bg-white text-slate-700 rounded-2xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4 text-maroon" />
            New Album
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-maroon text-white rounded-2xl text-sm font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Photo
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('photos')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'photos' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          All Photos
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'albums' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Albums ({albums.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder={activeTab === 'photos' ? "Search by album name..." : "Search albums..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-maroon animate-spin" />
        </div>
      ) : activeTab === 'photos' ? (
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
                    onClick={() => handleDeleteItem(item.id!)}
                    className="mt-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors w-fit shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-light">No photos found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAlbums.map((album) => (
              <motion.div
                key={album.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-video bg-slate-100 relative">
                  {album.coverImageUrl ? (
                    <img src={album.coverImageUrl} alt={album.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Folder className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => handleToggleFeatured(album)}
                      className={cn(
                        "p-2 rounded-xl transition-colors shadow-sm backdrop-blur",
                        album.isFeatured ? "bg-yellow-400 text-white" : "bg-white/90 text-slate-400 hover:text-yellow-500"
                      )}
                      title={album.isFeatured ? "Unfeature Album" : "Feature Album"}
                    >
                      <Star className={cn("h-4 w-4", album.isFeatured && "fill-current")} />
                    </button>
                    <button 
                      onClick={() => {
                        setNewImage(prev => ({ ...prev, albumId: album.id }));
                        setShowUploadModal(true);
                      }}
                      className="p-2 bg-maroon text-white rounded-xl hover:bg-maroon-dark transition-colors shadow-lg"
                      title="Add Photos to this Album"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingAlbumId(album.id);
                        setNewAlbum({
                          name: album.name,
                          description: album.description || '',
                          coverImageFile: null,
                          previewUrl: album.coverImageUrl || ''
                        });
                        setShowAlbumModal(true);
                      }}
                      className="p-2 bg-white/90 backdrop-blur rounded-xl text-slate-600 hover:text-maroon transition-colors shadow-sm"
                      title="Edit Album Info"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAlbum(album.id)}
                      className="p-2 bg-white/90 backdrop-blur rounded-xl text-slate-600 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-maroon transition-colors">{album.name}</h3>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{album.description}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                    Created {format(album.createdAt?.toDate?.() || new Date(), 'MMM d, yyyy')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredAlbums.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Folder className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-light">No albums found.</p>
            </div>
          )}
        </div>
      )}

      {/* Photo Upload Modal */}
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Album</label>
                  <div className="flex gap-2">
                    <select 
                      value={newImage.albumId}
                      onChange={(e) => setNewImage(prev => ({ ...prev, albumId: e.target.value }))}
                      className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    >
                      {albums.length === 0 ? (
                        <option value="">No albums created</option>
                      ) : (
                        albums.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))
                      )}
                    </select>
                    <button 
                      onClick={() => {
                        setShowUploadModal(false);
                        setShowAlbumModal(true);
                      }}
                      className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                      title="Create New Album"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Image Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Photos ({newImage.imageFiles.length}/20)</label>
                    {newImage.imageFiles.length > 0 && (
                      <button 
                        onClick={() => setNewImage(prev => ({ ...prev, imageFiles: [], previews: [] }))}
                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="relative group min-h-[160px] rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-maroon/30 transition-all">
                    {newImage.previews.length > 0 ? (
                      <div className="p-4 grid grid-cols-4 gap-2">
                        {newImage.previews.map((preview, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative group/item">
                            <img src={preview} alt="" className="w-full h-full object-cover" />
                            {!uploading && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewImage(prev => ({
                                    ...prev,
                                    imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
                                    previews: prev.previews.filter((_, i) => i !== idx)
                                  }));
                                }}
                                className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {newImage.previews.length < 20 && !uploading && (
                          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                            <Plus className="h-4 w-4 text-slate-400" />
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer absolute inset-0">
                        <Layers className="h-10 w-10 text-slate-300 mb-4" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                          Select Gallery Photos
                        </span>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.1em] font-light">Up to 20 images at once</p>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                      </label>
                    )}
                    
                    {uploading && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20">
                        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                          <svg className="w-full h-full -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              className="stroke-slate-100 fill-none"
                              strokeWidth="4"
                            />
                            <motion.circle
                              cx="40"
                              cy="40"
                              r="36"
                              className="stroke-maroon fill-none"
                              strokeWidth="4"
                              strokeDasharray="226.2"
                              animate={{ strokeDashoffset: 226.2 - (226.2 * uploadProgress) / 100 }}
                              transition={{ duration: 0.5 }}
                            />
                          </svg>
                          <span className="absolute text-xs font-bold text-slate-900">{uploadProgress}%</span>
                        </div>
                        
                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-bold text-maroon uppercase tracking-widest block">
                            {compressing ? 'Optimizing Quality...' : 'Uploading Batch...'}
                          </span>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                            {Math.floor((uploadProgress / 100) * newImage.imageFiles.length)} of {newImage.imageFiles.length} files
                          </p>
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
                    disabled={uploading || newImage.imageFiles.length === 0 || !newImage.albumId}
                    className="flex-[2] px-6 py-4 bg-maroon text-white rounded-2xl text-sm font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading Batch...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Add {newImage.imageFiles.length > 0 ? newImage.imageFiles.length : ''} Photos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Album Modal */}
      <AnimatePresence>
        {showAlbumModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !uploading && setShowAlbumModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-slate-900">
                  {editingAlbumId ? 'Edit Album' : 'Create New Album'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAlbumModal(false);
                    setEditingAlbumId(null);
                  }}
                  disabled={uploading}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Album Name</label>
                  <input 
                    type="text" 
                    value={newAlbum.name}
                    onChange={(e) => setNewAlbum(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
                    placeholder="e.g. Easter Celebration 2024"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={newAlbum.description}
                    onChange={(e) => setNewAlbum(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none min-h-[100px] resize-none"
                    placeholder="Brief info about this album..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cover Image (Optional)</label>
                  <div className="relative group aspect-video rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-maroon/30 transition-all">
                    {newAlbum.previewUrl ? (
                      <>
                        <img src={newAlbum.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer px-6 py-3 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-xl">
                            Change Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleAlbumCoverSelect} />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 w-full h-full cursor-pointer">
                        <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                          Select Cover
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleAlbumCoverSelect} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowAlbumModal(false);
                      setEditingAlbumId(null);
                    }}
                    disabled={uploading}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAlbum}
                    disabled={uploading || !newAlbum.name.trim()}
                    className="flex-[2] px-6 py-4 bg-maroon text-white rounded-2xl text-sm font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        {editingAlbumId ? 'Save Changes' : 'Create Album'}
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
