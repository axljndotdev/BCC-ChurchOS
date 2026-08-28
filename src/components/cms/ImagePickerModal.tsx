import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { compressImageToDataUrl } from '../../lib/imageUtils';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImageUrl?: string;
  title?: string;
}

const PRESET_CHURCH_IMAGES = [
  {
    category: 'Sanctuary & Worship',
    items: [
      { name: 'Worship Lights & Stage', url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Warm Church Sanctuary', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Praise & Hands Raised', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Stage Cross Glow', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1920' },
    ]
  },
  {
    category: 'Community & Fellowship',
    items: [
      { name: 'Congregation & Smiles', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Youth Group Fellowship', url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Family & Warm Welcome', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Outdoor Fellowship Gathering', url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1920' },
    ]
  },
  {
    category: 'Bible, Prayer & Faith',
    items: [
      { name: 'Open Bible in Natural Light', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Reverent Prayer Hands', url: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Cross on Mountain Dawn', url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1920' },
      { name: 'Candlelight & Scripture', url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1920' },
    ]
  }
];

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl = '',
  title = 'Select or Upload Photo'
}: ImagePickerModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState(currentImageUrl);
  const [selectedUrl, setSelectedUrl] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP).');
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
      setError('Failed to process image. Please try a different photo or use an image URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    const finalUrl = activeTab === 'url' ? customUrl.trim() : selectedUrl;
    if (finalUrl) {
      onSelectImage(finalUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-maroon/10 text-maroon rounded-2xl">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Choose from curated church photography, upload your own photo, or paste a link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Curated Presets
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="h-3.5 w-3.5" /> Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'url'
                ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" /> Image Link
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-6">
              {PRESET_CHURCH_IMAGES.map((group) => (
                <div key={group.category} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group.category}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {group.items.map((item) => {
                      const isSelected = selectedUrl === item.url;
                      return (
                        <button
                          key={item.url}
                          type="button"
                          onClick={() => setSelectedUrl(item.url)}
                          className={`group relative rounded-2xl overflow-hidden aspect-video border-2 transition-all text-left ${
                            isSelected ? 'border-maroon ring-4 ring-maroon/10 scale-[1.02]' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                            <span className="text-[11px] font-medium text-white leading-tight">{item.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-maroon text-white p-1 rounded-full shadow-lg">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-maroon rounded-3xl p-8 cursor-pointer bg-slate-50 hover:bg-maroon/5 transition-all text-center">
                <div className="p-4 bg-maroon/10 text-maroon rounded-full mb-3">
                  <Upload className="h-8 w-8" />
                </div>
                <span className="text-sm font-bold text-slate-900 mb-1">Click to browse or drop an image file</span>
                <span className="text-xs text-slate-500">Supports PNG, JPG, JPEG, WEBP. Automatically optimized for web fast loading.</span>
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
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Image Preview</span>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                    <img src={selectedUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
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
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">URL Image Preview</span>
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
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 truncate max-w-md">
            {selectedUrl ? 'Image ready for insertion' : 'Please select an image'}
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
      </div>
    </div>
  );
}
