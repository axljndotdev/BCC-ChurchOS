import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Folder, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { getGalleryItems, getGalleryAlbums } from '../services/db';
import { GalleryItem, GalleryAlbum } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % currentAlbumItems.length);
    }
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + currentAlbumItems.length) % currentAlbumItems.length);
    }
  };

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <section className="bg-slate-900 py-16 md:py-24 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatePresence mode="wait">
            {!selectedAlbumId ? (
              <motion.div
                key="home-header"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
              >
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">Photo Gallery</h1>
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
                  className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Albums
                </button>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 tracking-tight">{selectedAlbum?.name}</h1>
                <p className="text-slate-400 max-w-xl mx-auto font-light italic">
                  {selectedAlbum?.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!selectedAlbumId ? (
            <motion.div
              key="albums-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {albums.map((album, index) => {
                const albumPhotoCount = items.filter(i => i.albumId === album.id).length;
                return (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      {album.coverImageUrl ? (
                        <img 
                          src={album.coverImageUrl} 
                          alt={album.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <Folder className="h-20 w-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{albumPhotoCount} Photos</span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-white tracking-tight">{album.name}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-500 text-sm font-light line-clamp-2 italic">
                        "{album.description}"
                      </p>
                      <div className="mt-4 flex items-center justify-between text-maroon font-bold text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                        <span>View Album</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {albums.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Folder className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-slate-900">No Albums Yet</h3>
                  <p className="text-slate-500 font-light mt-2">Check back soon for church memories!</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="photos-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentAlbumItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                    onClick={() => openViewer(index)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.album}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Maximize2 className="h-8 w-8 text-white opacity-80" />
                    </div>
                  </motion.div>
                ))}
              </div>
              {currentAlbumItems.length === 0 && (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <ImageIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-slate-900">Album is Empty</h3>
                  <p className="text-slate-500 font-light mt-2">No photos have been added to this album yet.</p>
                  <button 
                    onClick={() => setSelectedAlbumId(null)}
                    className="mt-6 px-6 py-3 bg-maroon text-white rounded-xl text-sm font-bold shadow-lg shadow-maroon/20 hover:bg-maroon-dark transition-all"
                  >
                    Go Back
                  </button>
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
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={closeViewer}
          >
            <button
              onClick={closeViewer}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={showPrev}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={showNext}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            {/* Image Container */}
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentAlbumItems[selectedImageIndex].imageUrl}
                alt={currentAlbumItems[selectedImageIndex].album}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-display font-bold">{selectedAlbum?.name}</h3>
                <p className="text-white/60 text-sm mt-1">Image {selectedImageIndex + 1} of {currentAlbumItems.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
