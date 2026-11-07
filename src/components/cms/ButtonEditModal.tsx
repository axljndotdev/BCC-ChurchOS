import React, { useState, useEffect } from 'react';
import { X, Check, Link as LinkIcon, Edit3, Eye, EyeOff } from 'lucide-react';
import { CMSButtonConfig } from '../../types';

interface ButtonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialButton: CMSButtonConfig;
  onSave: (newBtn: CMSButtonConfig) => Promise<void> | void;
  label?: string;
}

export default function ButtonEditModal({
  isOpen,
  onClose,
  initialButton,
  onSave,
  label = 'Edit Button & Link'
}: ButtonEditModalProps) {
  const [btnData, setBtnData] = useState<CMSButtonConfig>(initialButton);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBtnData(initialButton || { label: 'Click Here', url: '/', visible: true, style: 'primary' });
  }, [initialButton, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(btnData);
      onClose();
    } catch (err) {
      console.error('Failed to save button edit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-maroon/10 text-maroon rounded-xl">
              <LinkIcon className="h-4 w-4" />
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

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Button Text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Button Text / Label
            </label>
            <input
              type="text"
              value={btnData.label || ''}
              onChange={(e) => setBtnData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g. Plan Your Visit"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-maroon"
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Destination URL Link
            </label>
            <input
              type="text"
              value={btnData.url || ''}
              onChange={(e) => setBtnData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="e.g. /about, /sermons, or https://..."
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-maroon font-mono"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Quick links:</span>
              {['/about', '/sermons', '/events', '/ministries', '/live', '/give', '/contact'].map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => setBtnData(prev => ({ ...prev, url: link }))}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700 font-mono"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility & Style */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Visibility
              </label>
              <button
                type="button"
                onClick={() => setBtnData(prev => ({ ...prev, visible: prev.visible !== false ? false : true }))}
                className={`w-full py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  btnData.visible !== false 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-slate-100 border-slate-300 text-slate-500'
                }`}
              >
                {btnData.visible !== false ? (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Hidden
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Button Theme
              </label>
              <select
                value={btnData.style || 'primary'}
                onChange={(e) => setBtnData(prev => ({ ...prev, style: e.target.value as any }))}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon font-semibold"
              >
                <option value="primary">Solid Maroon / Brand</option>
                <option value="secondary">Light / Outline</option>
                <option value="outline">Transparent Border</option>
                <option value="accent">Gold / Amber Accent</option>
              </select>
            </div>
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
