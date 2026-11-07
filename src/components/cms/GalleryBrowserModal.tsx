import React, { useState, useEffect } from 'react';
import { X, Folder, Image as ImageIcon, Upload, CheckSquare, Square, Layers, Loader2 } from 'lucide-react';
import { getGalleryAlbums, getGalleryItems, uploadFile } from '../../services/db';
import { GalleryAlbum, GalleryItem } from '../../types';
import { cn } from '../../lib/utils';
import imageCompression from 'browser-image-compression';

interface GalleryBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItems: (items: { type: 'photo' | 'video', url: string, caption?: string }[]) => void;
}

export default function GalleryBrowserModal({ isOpen, onClose, onSelectItems }: GalleryBrowserModalProps) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [albumsData, itemsData] = await Promise.all([getGalleryAlbums(), getGalleryItems()]);
      setAlbums(albumsData);
      setItems(itemsData);
    } catch (e) {
      console.error('Failed to load gallery items:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    setSelectedItems(newSelected);
  };

  const currentAlbum = albums.find(a => a.id === activeAlbumId);

  // Robust album filtering matching either albumId, album name or album slug
  const filteredItems = activeAlbumId 
    ? items.filter(item => {
        if (!item) return false;
        if (item.albumId && (item.albumId === activeAlbumId || item.albumId === currentAlbum?.name)) return true;
        if (item.album && currentAlbum?.name && item.album.toLowerCase().trim() === currentAlbum.name.toLowerCase().trim()) return true;
        return false;
      })
    : items;

  // When clicking an album in the sidebar, set active AND auto-select all its photos
  const handleSelectAlbum = (albumId: string | null) => {
    setActiveAlbumId(albumId);
    if (!albumId) {
      // Clear selection when returning to all photos so user isn't stuck
      setSelectedItems(new Set());
    } else {
      const alb = albums.find(a => a.id === albumId);
      const albItems = items.filter(item => {
        if (!item) return false;
        if (item.albumId && (item.albumId === albumId || item.albumId === alb?.name)) return true;
        if (item.album && alb?.name && item.album.toLowerCase().trim() === alb.name.toLowerCase().trim()) return true;
        return false;
      });
      const newSelected = new Set<string>();
      albItems.forEach(item => newSelected.add(item.id));
      setSelectedItems(newSelected);
    }
  };

  // Add entire current album directly in one click
  const handleAddEntireAlbum = () => {
    if (filteredItems.length === 0) return;
    const selectedMedia = filteredItems.map(item => ({
      type: 'photo' as const,
      url: item.imageUrl,
      caption: item.title || currentAlbum?.name || ''
    }));
    onSelectItems(selectedMedia);
    onClose();
  };

  // Select all photos currently visible or belonging to the album
  const selectAllFiltered = () => {
    const newSelected = new Set(selectedItems);
    filteredItems.forEach(item => newSelected.add(item.id));
    setSelectedItems(newSelected);
  };

  const deselectAllFiltered = () => {
    const newSelected = new Set(selectedItems);
    filteredItems.forEach(item => newSelected.delete(item.id));
    setSelectedItems(newSelected);
  };

  // Upload photos directly from local device
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedMedia: { type: 'photo', url: string, caption?: string }[] = [];
      for (const file of files) {
        let fileToUpload = file;
        if (file.size > 200 * 1024) {
          const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: false };
          fileToUpload = await imageCompression(file, options);
        }
        const url = await uploadFile(fileToUpload, 'events/gallery');
        if (url) {
          uploadedMedia.push({
            type: 'photo',
            url,
            caption: file.name.replace(/\.[^/.]+$/, '')
          });
        }
      }

      if (uploadedMedia.length > 0) {
        onSelectItems(uploadedMedia);
        onClose();
      }
    } catch (err) {
      console.error('Device upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    // If photos are checked, use checked photos. If an album is open and nothing checked yet, add the album photos.
    let itemsToAdd: GalleryItem[] = [];
    if (selectedItems.size > 0) {
      itemsToAdd = items.filter(item => selectedItems.has(item.id));
    } else if (activeAlbumId && filteredItems.length > 0) {
      itemsToAdd = filteredItems;
    }

    if (itemsToAdd.length === 0) return;

    const selectedMedia = itemsToAdd.map(item => ({
      type: 'photo' as const,
      url: item.imageUrl,
      caption: item.title || currentAlbum?.name || ''
    }));
    
    onSelectItems(selectedMedia);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#FAF6EE]">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-stone-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-maroon" />
              <span>Select Photos or Albums for Event</span>
            </h2>
            <p className="text-xs text-stone-500">Pick individual photos, select entire albums, or upload directly from your device.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar: Albums List & Device Upload */}
          <div className="w-full md:w-72 border-r border-slate-100 p-4 overflow-y-auto space-y-2 bg-slate-50 shrink-0">
            
            {/* Upload from Device button */}
            <div className="mb-3">
              <label className={cn(
                "w-full flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-maroon/40 rounded-2xl text-xs font-bold text-maroon hover:bg-maroon hover:text-white transition-all cursor-pointer shadow-xs",
                uploading ? "opacity-50 pointer-events-none" : ""
              )}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Compressing & Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload from Device</span>
                  </>
                )}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleDeviceUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1">
              Albums & Categories
            </div>

            <button 
              onClick={() => handleSelectAlbum(null)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-left",
                !activeAlbumId 
                  ? "bg-maroon text-white shadow-md shadow-maroon/20" 
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60"
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate">All Church Photos</span>
              </div>
              <span className="text-[10px] opacity-75 font-mono ml-2">({items.length})</span>
            </button>

            {albums.map(album => {
              const albumCount = items.filter(it => 
                (it.albumId && (it.albumId === album.id || it.albumId === album.name)) ||
                (it.album && it.album.toLowerCase().trim() === album.name.toLowerCase().trim())
              ).length;
              return (
                <button 
                  key={album.id}
                  onClick={() => handleSelectAlbum(album.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-left",
                    activeAlbumId === album.id 
                      ? "bg-maroon text-white shadow-md shadow-maroon/20" 
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="truncate">{album.name}</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono ml-2">({albumCount})</span>
                </button>
              );
            })}
          </div>

          {/* Right Main Grid */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* Action Bar */}
            <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span>{currentAlbum ? currentAlbum.name : 'All Photos'}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{filteredItems.length} available</span>
              </div>

              <div className="flex items-center gap-2">
                {currentAlbum && filteredItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddEntireAlbum}
                    className="px-3.5 py-1.5 bg-maroon hover:bg-maroon-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Add Entire Album ({filteredItems.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  disabled={filteredItems.length === 0}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-maroon" />
                  <span>Select All</span>
                </button>
                <button
                  type="button"
                  onClick={deselectAllFiltered}
                  disabled={selectedItems.size === 0}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>Deselect</span>
                </button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-maroon" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                  <ImageIcon className="h-10 w-10 stroke-1 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No photos found in this album.</p>
                  <p className="text-xs text-slate-400 mt-1">Upload photos using the button on the left.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map(item => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-xs hover:shadow-md",
                          isSelected ? "border-maroon ring-4 ring-maroon/20" : "border-slate-100 hover:border-slate-300"
                        )}
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.title || ''} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          referrerPolicy="no-referrer"
                        />
                        <div className={cn(
                          "absolute inset-0 transition-opacity flex items-center justify-center",
                          isSelected ? "bg-maroon/30 opacity-100" : "bg-black/0 group-hover:bg-black/20 opacity-0 group-hover:opacity-100"
                        )}>
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-transform",
                            isSelected ? "bg-maroon text-white scale-100" : "bg-white text-slate-700 scale-90"
                          )}>
                            ✓
                          </div>
                        </div>
                        {item.title && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white text-[10px] truncate">
                            {item.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-maroon">
              {selectedItems.size > 0 
                ? selectedItems.size 
                : (activeAlbumId && filteredItems.length > 0 ? filteredItems.length : 0)}
            </span> photo{((selectedItems.size > 0 ? selectedItems.size : (activeAlbumId ? filteredItems.length : 0)) === 1) ? '' : 's'} selected
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleConfirm} 
              disabled={selectedItems.size === 0 && (!activeAlbumId || filteredItems.length === 0)}
              className="px-6 py-2.5 bg-maroon text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-maroon-dark disabled:opacity-40 transition-all shadow-md shadow-maroon/20"
            >
              Add {selectedItems.size > 0 ? `(${selectedItems.size})` : (activeAlbumId && filteredItems.length > 0 ? `(${filteredItems.length})` : '')} to Event
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

