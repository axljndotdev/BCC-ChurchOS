import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSEdit } from '../../contexts/CMSEditContext';
import { useCMS } from '../../hooks/useCMS';
import { CMSButtonConfig } from '../../types';
import ButtonEditModal from './ButtonEditModal';

interface CMSButtonProps {
  pageId?: string;
  target?: {
    type: 'hero' | 'section' | 'card';
    buttonKey?: 'primaryButton' | 'secondaryButton';
    sectionId?: string;
    cardId?: string;
  };
  buttonConfig?: CMSButtonConfig;
  fallbackLabel?: string;
  fallbackUrl?: string;
  className?: string;
  containerClassName?: string;
  onSaveButton?: (newBtn: CMSButtonConfig) => Promise<void> | void;
  showArrow?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export default function CMSButton({
  pageId,
  target,
  buttonConfig,
  fallbackLabel = 'Learn More',
  fallbackUrl = '/about',
  className = 'inline-flex items-center justify-center px-8 py-4 bg-maroon text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-maroon/90 shadow-xl transition-all',
  containerClassName = 'inline-block',
  onSaveButton,
  showArrow = true,
  label,
  children
}: CMSButtonProps) {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { isEditMode } = useCMSEdit();
  const [modalOpen, setModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { pageData, savePage } = useCMS(pageId || '');

  const canEdit = !!((isSuperAdmin || isAdmin) && isEditMode && (pageId || onSaveButton));

  let currentBtn: CMSButtonConfig = buttonConfig || {
    label: fallbackLabel,
    url: fallbackUrl,
    visible: true,
    style: 'primary'
  };

  if (pageId && target && pageData) {
    if (target.type === 'hero' && target.buttonKey) {
      currentBtn = (pageData.hero as any)?.[target.buttonKey] || currentBtn;
    } else if (target.type === 'section' && target.sectionId) {
      const sec = (pageData.sections || []).find(s => s.id === target.sectionId);
      if (sec?.primaryButton) {
        currentBtn = sec.primaryButton;
      }
    } else if (target.type === 'card' && target.sectionId && target.cardId) {
      const sec = (pageData.sections || []).find(s => s.id === target.sectionId);
      const card = sec?.cards?.find(c => c.id === target.cardId);
      if (card) {
        currentBtn = {
          label: card.buttonLabel || fallbackLabel,
          url: card.buttonUrl || fallbackUrl,
          visible: card.buttonVisible !== false,
          style: 'primary'
        };
      }
    }
  }

  const handleSave = async (newBtn: CMSButtonConfig) => {
    if (onSaveButton) {
      await onSaveButton(newBtn);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      return;
    }

    if (pageId && target && pageData) {
      const updated = { ...pageData };

      if (target.type === 'hero' && target.buttonKey) {
        updated.hero = {
          ...updated.hero,
          [target.buttonKey]: newBtn
        };
      } else if (target.type === 'section' && target.sectionId) {
        updated.sections = (updated.sections || []).map(sec => {
          if (sec.id !== target.sectionId) return sec;
          return {
            ...sec,
            primaryButton: newBtn
          };
        });
      } else if (target.type === 'card' && target.sectionId && target.cardId) {
        updated.sections = (updated.sections || []).map(sec => {
          if (sec.id !== target.sectionId) return sec;
          const updatedCards = (sec.cards || []).map(c => {
            if (c.id !== target.cardId) return c;
            return {
              ...c,
              buttonLabel: newBtn.label,
              buttonUrl: newBtn.url,
              buttonVisible: newBtn.visible !== false
            };
          });
          return { ...sec, cards: updatedCards };
        });
      }

      await savePage(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  // If button is hidden and user is NOT admin
  if (currentBtn.visible === false && !canEdit) {
    return null;
  }

  const isExternal = currentBtn.url?.startsWith('http://') || currentBtn.url?.startsWith('https://');

  const renderContent = () => {
    return (
      <>
        {children || currentBtn.label || fallbackLabel}
        {showArrow && <ArrowRight className="ml-2 h-4 w-4 shrink-0" />}
      </>
    );
  };

  return (
    <div className={`relative inline-flex items-center group/cms-btn ${containerClassName}`}>
      {isExternal ? (
        <a
          href={currentBtn.url || fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${className} ${currentBtn.visible === false ? 'opacity-40 line-through' : ''}`}
        >
          {renderContent()}
        </a>
      ) : (
        <Link
          to={currentBtn.url || fallbackUrl}
          className={`${className} ${currentBtn.visible === false ? 'opacity-40 line-through' : ''}`}
        >
          {renderContent()}
        </Link>
      )}

      {/* Edit Trigger */}
      {canEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalOpen(true);
          }}
          className="ml-2 p-2 bg-maroon text-white hover:bg-slate-900 rounded-full shadow-md shadow-maroon/30 transition-all hover:scale-110 active:scale-95 border border-white/40 opacity-90 sm:opacity-50 sm:group-hover/cms-btn:opacity-100"
          title={`Edit ${label || currentBtn.label || 'Button'}`}
        >
          <Edit3 className="h-3 w-3" />
        </button>
      )}

      {/* Saved Check */}
      {savedSuccess && (
        <span className="absolute -top-7 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-50 animate-in fade-in">
          <Check className="h-3 w-3" /> Saved
        </span>
      )}

      {/* Modal */}
      {modalOpen && (
        <ButtonEditModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialButton={currentBtn}
          onSave={handleSave}
          label={label || `Edit Button: ${currentBtn.label || 'Action'}`}
        />
      )}
    </div>
  );
}
