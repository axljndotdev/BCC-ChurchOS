import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Folder, ArrowLeft, Image as ImageIcon, Star } from 'lucide-react';
import { getGalleryItems, getGalleryAlbums, getFeaturedAlbums } from '../services/db';
import { GalleryItem, GalleryAlbum } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

export default function Gallery() {
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
    <div className="pb-20">
      {/* Header */}
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
                  Featured Memories
                </div>
                <h1 className="text-4xl md:text-7xl font-display font-bold mb-6 tracking-tight">Our Gallery</h1>
                <p className="text-slate-400 max-w-2xl mx-auto font-light text-lg">
                  Capturing moments of faith, fellowship, and service in our community.
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-20">
        <AnimatePresence mode="wait">
          {!selectedAlbumId ? (
            <motion.div
              key="albums-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-24"
            >
              {/* Featured Albums Section */}
              {featuredAlbums.length > 0 && (
                <section className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {featuredAlbums.map((album, index) => (
                      <FeaturedAlbumCard 
                        key={album.id} 
                        album={album} 
                        index={index} 
                        items={items} 
                        onSelect={() => setSelectedAlbumId(album.id)} 
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Albums Section */}
              <section className="space-y-12">
                <div className="flex items-center gap-6">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">More Collections</h2>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                
                {loading && albums.length === 0 ? (
                  <div className="flex justify-center py-20">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {nonFeaturedAlbums.map((album, index) => (
                      <AlbumCard 
                        key={album.id} 
                        album={album} 
                        index={index} 
                        items={items} 
                        onSelect={() => setSelectedAlbumId(album.id)}
                      />
                    ))}
                  </div>
                )}

                {albums.length === 0 && !loading && (
                  <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-100">
                    <Folder className="h-20 w-20 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-display font-bold text-slate-900">No Albums Yet</h3>
                    <p className="text-slate-500 font-light mt-2 max-w-sm mx-auto">
                      Our community memories are being organized. Check back soon for beautiful moments!
                    </p>
                  </div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="photos-grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="py-12"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {loading && items.length === 0 ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-3xl"></div>
                  ))
                ) : (
                  currentAlbumItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border-4 border-white"
                      onClick={() => openViewer(index)}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.album}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-maroon/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="p-4 bg-white/90 backdrop-blur rounded-2xl shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
                          <Maximize2 className="h-6 w-6 text-maroon" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              {currentAlbumItems.length === 0 && !loading && (
                <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-100">
                  <ImageIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-slate-800">Album is Empty</h3>
                  <p className="text-slate-500 font-light mt-2">No photos have been added to this collection yet.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-Screen Viewer Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4"
            onClick={closeViewer}
          >
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-50">
              <div className="text-white">
                <h3 className="text-lg font-display font-bold">{selectedAlbum?.name}</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{selectedImageIndex + 1} / {currentAlbumItems.length}</p>
              </div>
              <button
                onClick={closeViewer}
                className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={showPrev}
              className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 p-6 bg-white/5 hover:bg-white/10 text-white rounded-3xl transition-all z-50 border border-white/5 group"
            >
              <ChevronLeft className="h-8 w-8 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={showNext}
              className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 p-6 bg-white/5 hover:bg-white/10 text-white rounded-3xl transition-all z-50 border border-white/5 group"
            >
              <ChevronRight className="h-8 w-8 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Image Container */}
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-full max-h-screen flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentAlbumItems[selectedImageIndex]?.imageUrl || ''}
                alt={currentAlbumItems[selectedImageIndex]?.album || ''}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeaturedAlbumCard({ album, index, items, onSelect }: { album: GalleryAlbum, index: number, items: GalleryItem[], onSelect: () => void }) {
  const photoCount = items.filter(i => i.albumId === album.id).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      onClick={onSelect}
      className="group cursor-pointer relative aspect-[16/9] md:aspect-auto md:h-[450px] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white"
    >
      <img 
        src={album.coverImageUrl || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200'} 
        alt={album.name}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
      
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20 shadow-xl">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          Featured Album
        </div>
      </div>

      <div className="absolute bottom-10 left-10 right-10">
        <div className="flex items-center gap-3 text-white/60 text-[10px] font-black uppercase tracking-[0.25em] mb-3">
          <ImageIcon className="h-4 w-4" />
          <span>{photoCount} Historical Captures</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tighter mb-4 group-hover:translate-x-2 transition-transform duration-500">
          {album.name}
        </h3>
        <p className="text-white/60 text-sm md:text-base font-light italic line-clamp-2 max-w-xl group-hover:text-white/90 transition-colors">
          "{album.description}"
        </p>
      </div>

      <div className="absolute bottom-10 right-10">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-maroon shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500 hover:bg-maroon hover:text-white">
          <ChevronRight className="h-8 w-8" />
        </div>
      </div>
    </motion.div>
  );
}

function AlbumCard({ album, index, items, onSelect }: { album: GalleryAlbum, index: number, items: GalleryItem[], onSelect: () => void }) {
  const photoCount = items.filter(i => i.albumId === album.id).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className="group cursor-pointer bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
    >
      <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
        {album.coverImageUrl ? (
          <img 
            src={album.coverImageUrl} 
            alt={album.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <Folder className="h-24 w-24" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">
            <ImageIcon className="h-3 w-3" />
            <span>{photoCount} Photos</span>
          </div>
          <h3 className="text-2xl font-display font-bold tracking-tight">{album.name}</h3>
        </div>
      </div>
      <div className="p-8 pb-10 flex-1 flex flex-col justify-between">
        <p className="text-slate-500 text-sm font-light leading-relaxed line-clamp-2 italic mb-6">
          "{album.description}"
        </p>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-maroon group-hover:translate-x-2 transition-transform duration-300">Open Gallery</span>
          <div className="p-3 bg-slate-50 rounded-2xl text-maroon group-hover:bg-maroon group-hover:text-white transition-all">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
