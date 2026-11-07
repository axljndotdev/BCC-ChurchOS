import React, { useState, useMemo } from 'react';
import { X, Upload, Link as LinkIcon, Check, Image as ImageIcon, Sparkles, Search, Trash2, Crop, Sliders } from 'lucide-react';
import { compressImageToDataUrl } from '../../lib/imageUtils';
import ImageCropper from './ImageCropper';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImageUrl?: string;
  title?: string;
  allowClear?: boolean;
  initialTab?: 'presets' | 'upload' | 'url' | 'crop';
}

export const PRESET_CHURCH_IMAGES = [
  {
    category: 'Sanctuary, Worship & Stage',
    items: [
      { name: 'Worship Lights & Sanctuary Stage', url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Warm Church Sanctuary Aisles', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Praise, Worship & Raised Hands', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Illuminated Cross on Stage', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Worship Acoustic Guitar & Band', url: 'https://images.unsplash.com/photo-1514525253344-f814d074358a?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Audio Visual & Tech Desk', url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=1920' }
    ]
  },
  {
    category: 'Fellowship, Community & Groups',
    items: [
      { name: 'Warm Congregation & Smiles', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Youth Group Gathering & Friends', url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Family Fellowship & Welcome', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Outdoor Lawn Gathering', url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Small Group Discussion & Coffee', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Circle of Women Encouragement', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Men of Faith (Sherpas)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1920' }
    ]
  },
  {
    category: 'Children & Superbook Kids',
    items: [
      { name: 'Children Learning & Smiles', url: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Kids Sunday School Activity', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Joyful Youth Fellowship', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1920' }
    ]
  },
  {
    category: 'Prayer, Scripture & Reflections',
    items: [
      { name: 'Open Bible in Natural Light', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Reverent Prayer Hands', url: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Cross on Mountain Dawn', url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Candlelight & Scripture', url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Peaceful Mountain Sanctuary', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Sunrise Hope & Grace', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&q=80&w=1920' }
    ]
  }
];

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl = '',
  title = 'Select, Crop or Upload Photo',
  allowClear = true,
  initialTab = 'presets'
}: ImagePickerModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url' | 'crop'>(
    initialTab === 'crop' && currentImageUrl ? 'crop' : initialTab
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState(currentImageUrl);
  const [selectedUrl, setSelectedUrl] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeImageForCrop = selectedUrl || customUrl || currentImageUrl;

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_CHURCH_IMAGES;
    const q = searchQuery.toLowerCase();
    return PRESET_CHURCH_IMAGES.map(group => ({
      category: group.category,
      items: group.items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        group.category.toLowerCase().includes(q)
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      // Compress image to safe web data url (<200KB)
      const dataUrl = await compressImageToDataUrl(file, {
        maxDimension: 1600,
        initialQuality: 0.85,
        targetMaxSizeBytes: 200 * 1024
      });
      setSelectedUrl(dataUrl);
    } catch (err) {
      console.error('Image compression failed:', err);
      setError('Failed to process image. Please try a different photo or use a direct URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleCropApplied = (croppedDataUrl: string) => {
    setSelectedUrl(croppedDataUrl);
    onSelectImage(croppedDataUrl);
    onClose();
  };

  const handleConfirm = () => {
    const finalUrl = activeTab === 'url' ? customUrl.trim() : selectedUrl;
    onSelectImage(finalUrl || '');
    onClose();
  };

  const handleClear = () => {
    setSelectedUrl('');
    setCustomUrl('');
    onSelectImage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-maroon/10 text-maroon rounded-2xl">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Pick photography, upload, paste link, or crop & fit framing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-4 sm:px-6 bg-slate-50 gap-2">
          <div className="flex overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'presets'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Curated Presets
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="h-3.5 w-3.5" /> Upload File
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'url'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" /> Image Link
            </button>
            <button
              onClick={() => setActiveTab('crop')}
              disabled={!activeImageForCrop}
              className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'crop'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : activeImageForCrop
                    ? 'border-transparent text-slate-700 hover:text-maroon'
                    : 'border-transparent text-slate-300 cursor-not-allowed'
              }`}
            >
              <Crop className="h-3.5 w-3.5 text-amber-500" /> Crop & Adjust
            </button>
          </div>

          {activeTab === 'presets' && (
            <div className="relative py-2">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search photo presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-maroon w-44 sm:w-56"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* TAB 1: CURATED PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              {selectedUrl && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img src={selectedUrl} alt="Selected" className="h-12 w-16 rounded-xl object-cover border border-amber-200 shrink-0" referrerPolicy="no-referrer" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">Photo Selected</span>
                      <span className="text-[11px] text-amber-700">Want to crop, zoom, or adjust framing?</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('crop')}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Crop className="h-3.5 w-3.5" /> Open Crop & Adjust Studio
                  </button>
                </div>
              )}

              {filteredPresets.map((group) => (
                <div key={group.category} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group.category}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {group.items.map((item) => {
                      const isSelected = selectedUrl === item.url;
                      return (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => setSelectedUrl(item.url)}
                          className={`group relative rounded-2xl overflow-hidden aspect-[4/3] border-2 transition-all text-left ${
                            isSelected ? 'border-maroon ring-4 ring-maroon/10 scale-[1.02]' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                            <span className="text-[11px] font-medium text-white leading-tight">{item.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-maroon text-white p-1 rounded-full shadow-lg">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredPresets.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No preset photos found matching "{searchQuery}".
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-maroon rounded-3xl p-8 cursor-pointer bg-slate-50 hover:bg-maroon/5 transition-all text-center">
                <div className="p-4 bg-maroon/10 text-maroon rounded-full mb-3">
                  <Upload className="h-8 w-8" />
                </div>
                <span className="text-sm font-bold text-slate-900 mb-1">Click to browse or drop an image file</span>
                <span className="text-xs text-slate-500">Supports PNG, JPG, JPEG, WEBP. Automatically optimized for fast web loading.</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {uploading && (
                <div className="text-center py-4 text-xs font-semibold text-maroon animate-pulse">
                  Optimizing and preparing image...
                </div>
              )}

              {selectedUrl && !uploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Uploaded Image Preview</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('crop')}
                      className="px-3.5 py-1.5 bg-maroon text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-maroon/90 shadow-sm"
                    >
                      <Crop className="h-3.5 w-3.5" /> Adjust & Crop Image
                    </button>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative max-w-lg mx-auto">
                    <img src={selectedUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMAGE LINK */}
          {activeTab === 'url' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-700 mb-1.5">
                  Direct Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setSelectedUrl(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">Paste any valid public image link (Unsplash, cloud CDN, etc.)</p>
              </div>

              {customUrl && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">URL Image Preview</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUrl(customUrl);
                        setActiveTab('crop');
                      }}
                      className="px-3.5 py-1.5 bg-maroon text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-maroon/90 shadow-sm"
                    >
                      <Crop className="h-3.5 w-3.5" /> Adjust & Crop Image
                    </button>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src={customUrl}
                      alt="URL Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setError('Unable to preview this image link. Make sure the URL is accessible.')}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CROP, FIT & ADJUST STUDIO */}
          {activeTab === 'crop' && (
            <div>
              {activeImageForCrop ? (
                <ImageCropper
                  imageSrc={activeImageForCrop}
                  onApply={handleCropApplied}
                  onCancel={() => setActiveTab('presets')}
                />
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Please select or upload an image first to crop and adjust.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer (Hidden in Crop tab since ImageCropper has its own apply button) */}
        {activeTab !== 'crop' && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              {allowClear && (currentImageUrl || selectedUrl) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove Image
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedUrl && !customUrl}
                className="px-6 py-2.5 bg-maroon text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-maroon/90 shadow-md shadow-maroon/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Check className="h-4 w-4" /> Apply Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
