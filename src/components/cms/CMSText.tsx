import React, { useState } from 'react';
import { Edit3, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSEdit } from '../../contexts/CMSEditContext';
import { useCMS } from '../../hooks/useCMS';
import TextEditModal from './TextEditModal';

interface CMSTextProps {
  pageId?: string;
  target?: {
    type: 'hero' | 'section' | 'card';
    field: string;
    sectionId?: string;
    cardId?: string;
  };
  value?: string;
  fallbackText?: string;
  onSaveText?: (newText: string) => Promise<void> | void;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  containerClassName?: string;
  label?: string;
  multiline?: boolean;
  children?: React.ReactNode;
}

export default function CMSText({
  pageId,
  target,
  value,
  fallbackText,
  onSaveText,
  as: Component = 'span',
  className = '',
  containerClassName = '',
  label,
  multiline,
  children
}: CMSTextProps) {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { isEditMode } = useCMSEdit();
  const [modalOpen, setModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { pageData, savePage } = useCMS(pageId || '');

  const canEdit = !!((isSuperAdmin || isAdmin) && isEditMode && (pageId || onSaveText));

  // Determine current displayed text
  let displayText = value ?? (typeof children === 'string' ? children : fallbackText) ?? '';

  if (pageId && target && pageData) {
    if (target.type === 'hero') {
      displayText = (pageData.hero as any)?.[target.field] ?? displayText;
    } else if (target.type === 'section' && target.sectionId) {
      const sec = (pageData.sections || []).find(s => s.id === target.sectionId);
      if (sec) {
        if (target.field.startsWith('quote.')) {
          const qKey = target.field.split('.')[1];
          displayText = (sec.quote as any)?.[qKey] ?? displayText;
        } else {
          displayText = (sec as any)?.[target.field] ?? displayText;
        }
      }
    } else if (target.type === 'card' && target.sectionId && target.cardId) {
      const sec = (pageData.sections || []).find(s => s.id === target.sectionId);
      const card = sec?.cards?.find(c => c.id === target.cardId);
      if (card) {
        displayText = (card as any)?.[target.field] ?? displayText;
      }
    }
  }

  const handleSave = async (newText: string) => {
    if (onSaveText) {
      await onSaveText(newText);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      return;
    }

    if (pageId && target && pageData) {
      const updated = { ...pageData };

      if (target.type === 'hero') {
        updated.hero = {
          ...updated.hero,
          [target.field]: newText
        };
      } else if (target.type === 'section' && target.sectionId) {
        updated.sections = (updated.sections || []).map(sec => {
          if (sec.id !== target.sectionId) return sec;
          if (target.field.startsWith('quote.')) {
            const qKey = target.field.split('.')[1];
            return {
              ...sec,
              quote: {
                ...(sec.quote || { text: '', author: '' }),
                [qKey]: newText
              }
            };
          }
          return {
            ...sec,
            [target.field]: newText
          };
        });
      } else if (target.type === 'card' && target.sectionId && target.cardId) {
        updated.sections = (updated.sections || []).map(sec => {
          if (sec.id !== target.sectionId) return sec;
          const updatedCards = (sec.cards || []).map(c => 
            c.id === target.cardId ? { ...c, [target.field]: newText } : c
          );
          return {
            ...sec,
            cards: updatedCards
          };
        });
      }

      await savePage(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  if (!canEdit) {
    return <Component className={className}>{displayText || children}</Component>;
  }

  return (
    <span className={`relative inline-block group/cms-text ${containerClassName}`}>
      <Component className={className}>
        {displayText || children}
      </Component>

      {/* Edit Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setModalOpen(true);
        }}
        aria-label={`Edit ${label || target?.field || 'text'}`}
        className="inline-flex items-center justify-center ml-1.5 align-middle p-1.5 bg-maroon text-white hover:bg-slate-900 rounded-full shadow-md shadow-maroon/30 transition-all hover:scale-110 active:scale-95 border border-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400 opacity-90 sm:opacity-40 sm:group-hover/cms-text:opacity-100"
        title={`Edit ${label || target?.field || 'text'}`}
      >
        <Edit3 className="h-3 w-3" />
      </button>

      {/* Saved Toast */}
      {savedSuccess && (
        <span className="absolute -top-7 left-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-50 animate-in fade-in">
          <Check className="h-3 w-3" /> Saved
        </span>
      )}

      {/* Modal */}
      {modalOpen && (
        <TextEditModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialValue={displayText}
          onSave={handleSave}
          label={label || `Edit ${target?.field || 'Text'}`}
          multiline={multiline ?? (displayText.length > 50)}
        />
      )}
    </span>
  );
}
