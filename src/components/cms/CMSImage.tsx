import React, { useState } from 'react';
import { Camera, Sparkles, Check, Crop } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSEdit } from '../../contexts/CMSEditContext';
import { useCMS } from '../../hooks/useCMS';
import ImagePickerModal from './ImagePickerModal';

interface CMSImageProps {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  pageId?: string;
  target?: {
    type: 'hero' | 'section' | 'card' | 'gallery';
    sectionId?: string;
    cardId?: string;
    index?: number;
  };
  onImageUpdated?: (newUrl: string) => void;
  title?: string;
  fallbackSrc?: string;
}

export default function CMSImage({
  src,
  alt = 'Image',
  className = 'w-full h-full object-cover',
  containerClassName = '',
  pageId,
  target,
  onImageUpdated,
  title,
  fallbackSrc = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200'
}: CMSImageProps) {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { isEditMode } = useCMSEdit();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'presets' | 'crop'>('presets');
  const [savedBadge, setSavedBadge] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { pageData, savePage } = useCMS(pageId || '');

  const canEdit = !!((isSuperAdmin || isAdmin) && isEditMode && (pageId || onImageUpdated));

  let currentSource = src;
  if (pageId && target && pageData) {
    if (target.type === 'hero') {
      currentSource = pageData.hero?.imageUrl || currentSource;
    } else if (target.type === 'section' && target.sectionId) {
      const sec = (pageData.sections || []).find(s => s.id === target.sectionId);
      if (sec && sec.imageUrl) {
        currentSource = sec.imageUrl;
      }
    } else if (target.type === 'card' && target.sectionId && target.cardId) {
      const sec = (pageData.sections || []).find(s => s.id === target.sectionId);
      const card = sec?.cards?.find(c => c.id === target.cardId);
      if (card && card.imageUrl) {
        currentSource = card.imageUrl;
      }
    }
  }

  const displaySrc = (!imgError && currentSource) ? currentSource : fallbackSrc;

  const handleSelectImage = async (newUrl: string) => {
    if (onImageUpdated) {
      onImageUpdated(newUrl);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2500);
      return;
    }

    if (pageId && target && pageData) {
      const updatedPage = { ...pageData };

      if (target.type === 'hero') {
        updatedPage.hero = {
          ...updatedPage.hero,
          imageUrl: newUrl
        };
      } else if (target.type === 'section' && target.sectionId) {
        updatedPage.sections = (updatedPage.sections || []).map(sec => 
          sec.id === target.sectionId ? { ...sec, imageUrl: newUrl } : sec
        );
      } else if (target.type === 'card' && target.sectionId && target.cardId) {
        updatedPage.sections = (updatedPage.sections || []).map(sec => {
          if (sec.id !== target.sectionId) return sec;
          const updatedCards = (sec.cards || []).map(c => 
            c.id === target.cardId ? { ...c, imageUrl: newUrl } : c
          );
          return { ...sec, cards: updatedCards };
        });
      }

      await savePage(updatedPage);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2500);
    }
  };

  return (
    <div className={`relative group/cms-img ${containerClassName}`}>
      <img
        src={displaySrc}
        alt={alt}
        className={className}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />

      {/* Mobile-first touch-friendly edit buttons */}
      {canEdit && (
        <div className="absolute top-3 right-3 z-30 pointer-events-auto flex items-center gap-1.5 sm:opacity-85 sm:group-hover/cms-img:opacity-100 transition-opacity">
          {displaySrc && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setModalTab('crop');
                setModalOpen(true);
              }}
              className="bg-amber-600/95 hover:bg-amber-600 text-white text-[11px] font-bold px-3 py-2 rounded-full backdrop-blur-md shadow-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-white/20"
              title="Crop, fit, zoom & adjust this photo"
            >
              <Crop className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Crop / Fit</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setModalTab('presets');
              setModalOpen(true);
            }}
            className="bg-slate-900/90 hover:bg-maroon text-white text-[11px] font-bold px-3 py-2 rounded-full backdrop-blur-md shadow-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-white/20"
            title="Edit / Replace this photo"
          >
            <Camera className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Change Photo</span>
          </button>
        </div>
      )}

      {/* Success Badge */}
      {savedBadge && (
        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-30 animate-in fade-in">
          <Check className="h-3.5 w-3.5" /> Photo Saved
        </div>
      )}

      {/* Image Picker Modal */}
      {modalOpen && (
        <ImagePickerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelectImage={handleSelectImage}
          currentImageUrl={displaySrc}
          title={title || `Edit ${alt}`}
          initialTab={modalTab}
        />
      )}
    </div>
  );
}
