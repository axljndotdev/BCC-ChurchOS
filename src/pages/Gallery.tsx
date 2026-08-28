import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Folder, ArrowLeft, Image as ImageIcon, Star } from 'lucide-react';
import { getGalleryItems, getGalleryAlbums, getFeaturedAlbums } from '../services/db';
import { GalleryItem, GalleryAlbum } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { cn } from '../lib/utils';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

export default function Gallery() {
  const { pageData } = useCMS('gallery');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [featuredAlbums, setFeaturedAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch featured albums first for immediate feedback
      const featured = await getFeaturedAlbums();
      setFeaturedAlbums(featured);
      
      // Load everything else in background
      const [itemsData, albumsData] = await Promise.all([
        getGalleryItems(),
        getGalleryAlbums()
      ]);
      setItems(itemsData);
      setAlbums(albumsData);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openViewer = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeViewer = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  const currentAlbumItems = selectedAlbumId 
    ? items.filter(item => item.albumId === selectedAlbumId)
    : [];

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && currentAlbumItems.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % currentAlbumItems.length);
    }
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && currentAlbumItems.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + currentAlbumItems.length) % currentAlbumItems.length);
    }
  };

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId);
  const nonFeaturedAlbums = albums.filter(a => !featuredAlbums.some(f => f.id === a.id));

  return (
    <div className="pb-20 relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="gallery" pageName="Photo Gallery" />

      {/* Header */}
      {pageData?.hero?.visible !== false && (
        <section className="bg-slate-900 py-20 md:py-32 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatePresence mode="wait">
              {!selectedAlbumId ? (
                <motion.div
                  key="home-header"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-white/5 backdrop-blur-sm">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    {pageData?.hero?.badge || 'Featured Memories'}
                  </div>
                  <h1 className="text-4xl md:text-7xl font-display font-bold mb-6 tracking-tight">
                    {pageData?.hero?.title || 'Our Gallery'}
                  </h1>
                  {pageData?.hero?.subtitle && (
                    <p className="text-amber-400 font-medium mb-3 text-lg">{pageData.hero.subtitle}</p>
                  )}
                  <p className="text-slate-400 max-w-2xl mx-auto font-light text-lg">
                    {pageData?.hero?.description || 'Capturing moments of faith, fellowship, and service in our community.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="album-header"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center"
                >
                  <button 
                    onClick={() => setSelectedAlbumId(null)}
                    className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-all text-xs font-black uppercase tracking-widest group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to All Albums
                  </button>
                  <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">{selectedAlbum?.name}</h1>
                  <div className="w-20 h-1 bg-maroon rounded-full mb-6"></div>
                  <p className="text-slate-400 max-w-xl mx-auto font-light italic text-lg leading-relaxed">
                    {selectedAlbum?.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedAlbumId ? (
          /* Album View (Photos inside album) */
          <div>
            {currentAlbumItems.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No photos found in this album yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentAlbumItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layoutId={`gallery-item-${item.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openViewer(index)}
                    className="group relative aspect-square bg-slate-100 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title || 'Bethesda Gallery'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider">{item.category || 'Moments'}</span>
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-full">
                          <Maximize2 className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Albums Overview */
          <div className="space-y-16">
            {/* Featured Albums (Hero-style highlights) */}
            {featuredAlbums.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
                  <Star className="h-5 w-5 text-maroon fill-maroon" /> Featured Highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredAlbums.map((album) => (
                    <motion.div
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="group relative aspect-[16/10] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                    >
                      <img 
                        src={album.coverImageUrl || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200'} 
                        alt={album.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-8 md:p-10 flex flex-col justify-end text-white">
                        <div className="space-y-2">
                          <span className="inline-block px-3 py-1 bg-maroon text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                            Featured Album
                          </span>
                          <h3 className="text-3xl font-display font-bold group-hover:translate-x-1 transition-transform">{album.name}</h3>
                          <p className="text-slate-300 text-sm font-light line-clamp-2">{album.description}</p>
                          <p className="text-xs text-white/60 font-semibold pt-2">
                            {items.filter(i => i.albumId === album.id).length} Photos
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other / Standard Albums */}
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
                <Folder className="h-5 w-5 text-slate-400" /> Photo Collections
              </h2>
              {albums.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 p-8">
                  <Folder className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No Albums Created Yet</h3>
                  <p className="text-slate-400 text-sm mt-1">Check back soon for event and community photos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                        <img 
                          src={album.coverImageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'} 
                          alt={album.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                          {items.filter(i => i.albumId === album.id).length} Photos
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-maroon transition-colors">{album.name}</h3>
                          <p className="text-slate-500 font-light text-xs mt-2 line-clamp-2">{album.description || 'View collection'}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-maroon">
                          <span>Browse Album</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Modal Image Viewer */}
      <AnimatePresence>
        {selectedImageIndex !== null && currentAlbumItems[selectedImageIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewer}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none"
          >
            <button 
              onClick={closeViewer}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left Prev Arrow */}
            {currentAlbumItems.length > 1 && (
              <button 
                onClick={showPrev}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 z-50 cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Main Lightbox Image */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            >
              <motion.img 
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={currentAlbumItems[selectedImageIndex].imageUrl} 
                alt="Enlarged" 
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 text-center text-white space-y-1">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  {selectedImageIndex + 1} of {currentAlbumItems.length}
                </p>
                {currentAlbumItems[selectedImageIndex].title && (
                  <p className="font-display font-medium text-lg">{currentAlbumItems[selectedImageIndex].title}</p>
                )}
              </div>
            </div>

            {/* Right Next Arrow */}
            {currentAlbumItems.length > 1 && (
              <button 
                onClick={showNext}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 z-50 cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
