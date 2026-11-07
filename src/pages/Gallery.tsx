import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Folder, ArrowLeft, Image as ImageIcon, Star, Sparkles } from 'lucide-react';
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
      const featured = await getFeaturedAlbums();
      setFeaturedAlbums(featured);
      
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

  // Keyboard navigation for viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') closeViewer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, currentAlbumItems.length]);

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId);
  const nonFeaturedAlbums = albums.filter(a => !featuredAlbums.some(f => f.id === a.id));

  return (
    <div className="pb-24 sm:pb-32 relative bg-[#FAF7F2] min-h-screen">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="gallery" pageName="Photo Gallery" />

      {/* Header */}
      {pageData?.hero?.visible !== false && (
        <section className="bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] py-14 sm:py-20 md:py-28 text-center text-white relative overflow-hidden border-b border-[#C99738]/30">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7A121D] to-transparent" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatePresence mode="wait">
              {!selectedAlbumId ? (
                <motion.div
                  key="home-header"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-2xl">
                    <span className="text-[#E5B869] font-display">✦</span>
                    <span>{pageData?.hero?.badge || 'Moments of Fellowship'}</span>
                    <span className="text-[#E5B869] font-display">✦</span>
                  </div>
                  <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-3 sm:mb-6 tracking-tight text-white">
                    {pageData?.hero?.title || 'Our Gallery'}
                  </h1>
                  {pageData?.hero?.subtitle && (
                    <p className="text-base sm:text-xl text-[#E5B869] font-display italic mb-2 sm:mb-3">{pageData.hero.subtitle}</p>
                  )}
                  <p className="text-stone-300 max-w-2xl mx-auto font-light text-xs sm:text-base leading-relaxed">
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
                    className="mb-6 flex items-center gap-2 text-[#E5B869] hover:text-white transition-all text-xs font-bold uppercase tracking-widest min-h-[40px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to All Albums
                  </button>
                  <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 tracking-tight text-white">{selectedAlbum?.name}</h1>
                  <div className="w-16 h-0.5 bg-[#C99738] rounded-full mb-4"></div>
                  <p className="text-stone-300 max-w-xl mx-auto font-light italic text-xs sm:text-base leading-relaxed">
                    {selectedAlbum?.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-stone-500 font-light text-xs sm:text-sm">Loading memories...</p>
          </div>
        ) : selectedAlbumId ? (
          /* Album View (Photos inside album) */
          <div>
            {currentAlbumItems.length === 0 ? (
              <div className="text-center py-16 sm:py-24 bg-[#FAF6EE] rounded-2xl sm:rounded-3xl border border-dashed border-[#E8D5B5]">
                <ImageIcon className="h-12 w-12 text-[#C99738]/40 mx-auto mb-3" />
                <p className="text-stone-600 font-medium text-sm">No photos found in this album yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {currentAlbumItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layoutId={`gallery-item-${item.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => openViewer(index)}
                    className="group relative aspect-square bg-[#FAF6EE] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E8D5B5]"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title || 'Bethesda Gallery'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B0E]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 sm:p-4 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-200 truncate">{item.category || 'Moments'}</span>
                        <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-full shrink-0">
                          <Maximize2 className="h-3.5 w-3.5" />
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
          <div className="space-y-12 sm:space-y-16">
            {/* Featured Albums (Hero-style highlights) */}
            {featuredAlbums.length > 0 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 border-b border-[#E8D5B5] pb-3">
                  <span className="text-[#C99738]">✦</span>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900">Featured Collections</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                  {featuredAlbums.map((album) => (
                    <motion.div
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="group relative aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#E8D5B5]"
                    >
                      <img 
                        src={album.coverImageUrl || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200'} 
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B0E]/90 via-[#1A0B0E]/40 to-transparent" />
                      <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end text-white">
                        <span className="text-[10px] font-bold text-[#E5B869] uppercase tracking-[0.2em] mb-1 sm:mb-2 flex items-center gap-1.5">
                          <Folder className="h-3.5 w-3.5 text-[#C99738]" /> Collection
                        </span>
                        <h3 className="text-xl sm:text-2xl font-display font-bold mb-1 group-hover:text-[#E5B869] transition-colors">{album.name}</h3>
                        <p className="text-stone-300 text-xs sm:text-sm font-light line-clamp-2 max-w-lg mb-3">
                          {album.description}
                        </p>
                        <div className="flex items-center text-xs font-bold uppercase tracking-wider text-[#E5B869] group-hover:translate-x-1 transition-transform">
                          <span>View Photos</span> &rarr;
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* All / Community Albums */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 border-b border-[#E8D5B5] pb-3">
                <span className="text-[#C99738]">✦</span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900">All Photo Albums</h2>
              </div>
              
              {albums.length === 0 ? (
                <div className="text-center py-16 bg-[#FAF6EE] rounded-2xl border border-dashed border-[#E8D5B5]">
                  <p className="text-stone-500 font-light text-sm">No albums created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300 border border-[#E8D5B5] flex flex-col justify-between"
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                          src={album.coverImageUrl || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800'} 
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                          Photos
                        </div>
                      </div>
                      <div className="p-5 sm:p-6 space-y-2">
                        <h3 className="text-lg sm:text-xl font-display font-bold text-stone-900 group-hover:text-[#7A121D] transition-colors">{album.name}</h3>
                        <p className="text-stone-600 font-light text-xs sm:text-sm line-clamp-2 leading-relaxed">
                          {album.description || "Captured church family memories and celebrations."}
                        </p>
                        <div className="pt-3 border-t border-[#E8D5B5]/60 flex items-center justify-between text-xs font-bold text-[#7A121D] uppercase tracking-wider">
                          <span>Browse Album</span>
                          <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
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

      {/* Lightbox / Modal Image Viewer (Mobile First & All Screens) */}
      <AnimatePresence>
        {selectedImageIndex !== null && currentAlbumItems[selectedImageIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewer}
            className="fixed inset-0 z-50 bg-[#1A0B0E]/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 select-none"
          >
            {/* Top Close Bar */}
            <div className="w-full flex items-center justify-between z-50 py-2">
              <span className="text-xs uppercase tracking-widest text-[#E5B869] font-bold">
                {selectedImageIndex + 1} / {currentAlbumItems.length}
              </span>
              <button 
                onClick={closeViewer}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                aria-label="Close photo viewer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main Stage with Side Arrows on Desktop */}
            <div className="relative w-full flex-1 flex items-center justify-center min-h-0 py-2">
              {/* Left Arrow (Desktop / Tablet) */}
              {currentAlbumItems.length > 1 && (
                <button 
                  onClick={showPrev}
                  className="hidden md:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-all hover:scale-105 z-50 cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Main Image */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative max-w-5xl max-h-full flex flex-col items-center justify-center"
              >
                <motion.img 
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={currentAlbumItems[selectedImageIndex].imageUrl} 
                  alt={currentAlbumItems[selectedImageIndex].title || "Enlarged photo"} 
                  className="max-h-[68svh] sm:max-h-[75vh] w-auto max-w-full rounded-xl sm:rounded-2xl shadow-2xl object-contain border border-[#C99738]/30"
                  referrerPolicy="no-referrer"
                />
                {currentAlbumItems[selectedImageIndex].title && (
                  <p className="mt-3 text-center text-white font-display text-sm sm:text-base font-medium max-w-md px-4 truncate">
                    {currentAlbumItems[selectedImageIndex].title}
                  </p>
                )}
              </div>

              {/* Right Arrow (Desktop / Tablet) */}
              {currentAlbumItems.length > 1 && (
                <button 
                  onClick={showNext}
                  className="hidden md:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-all hover:scale-105 z-50 cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Mobile Thumb Navigation Bar */}
            {currentAlbumItems.length > 1 && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xs flex items-center justify-between gap-3 py-3 z-50"
              >
                <button
                  onClick={showPrev}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 min-h-[44px]"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  onClick={showNext}
                  className="flex-1 py-3 px-4 bg-[#7A121D] hover:bg-[#5C0612] text-white border border-[#C99738] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 min-h-[44px]"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
