import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, Sparkles } from 'lucide-react';

interface TextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (newValue: string) => Promise<void> | void;
  label?: string;
  multiline?: boolean;
}

export default function TextEditModal({
  isOpen,
  onClose,
  initialValue,
  onSave,
  label = 'Edit Text Content',
  multiline = false
}: TextEditModalProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(value);
      onClose();
    } catch (err) {
      console.error('Failed to save text edit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-maroon/10 text-maroon rounded-xl">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon block">
                Quick In-Place Edit
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {label}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Content Text
            </label>
            {multiline || (initialValue && initialValue.length > 60) ? (
              <textarea
                rows={5}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter text..."
                autoFocus
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-maroon leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter text..."
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm sm:text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-maroon"
              />
            )}
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Saves instantly to live website and Firestore.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-maroon hover:bg-maroon/90 text-white font-bold rounded-full text-xs uppercase tracking-wider shadow-md shadow-maroon/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
