import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Edit3, Settings, ShieldCheck, CheckCircle2, Eye, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSEdit } from '../../contexts/CMSEditContext';
import { useCMS } from '../../hooks/useCMS';
import PageCMSDrawer from './PageCMSDrawer';

interface VisualCMSBarProps {
  pageId: string;
  pageName?: string;
}

export default function VisualCMSBar({ pageId, pageName }: VisualCMSBarProps) {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { isEditMode, toggleEditMode } = useCMSEdit();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pageData, savePage, resetPage, loading } = useCMS(pageId);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isSuperAdmin && !isAdmin) return null;

  const handleSaveAndNotify = async (updatedData: any) => {
    const ok = await savePage(updatedData);
    if (ok) {
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    }
    return ok;
  };

  return (
    <>
      {/* Floating Super Admin Mobile-Friendly Action Bar */}
      <aside 
        aria-label="Super Admin Visual Editor Toolbar"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md px-3 sm:px-5 py-2 rounded-full shadow-2xl border border-slate-700/90 flex items-center gap-2 sm:gap-3 max-w-[95vw] transition-all"
      >
        {/* Badge & Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 pr-2 border-r border-slate-700">
          <button
            type="button"
            onClick={toggleEditMode}
            className={`p-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
              isEditMode 
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isEditMode ? 'Edit Mode is Active (tap to preview site)' : 'Edit Mode is OFF (tap to turn on edit buttons)'}
          >
            {isEditMode ? (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider hidden sm:inline">Editing ON</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider hidden sm:inline">Preview</span>
              </>
            )}
          </button>

          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden md:inline truncate max-w-[120px]">
            {pageName || pageId}
          </span>
        </div>

        {/* Edit In Place Prompt / Drawer button */}
        <div className="flex items-center gap-1.5">
          {isEditMode ? (
            <span className="text-[11px] text-amber-300 font-medium px-2 py-1 bg-amber-400/10 rounded-full border border-amber-400/20 hidden sm:inline">
              ✏️ Tap any text, photo, or button to edit
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 px-2 py-1 hidden sm:inline">
              Previewing live view
            </span>
          )}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            disabled={loading}
            className="px-3 py-1.5 bg-maroon hover:bg-maroon/90 text-white font-bold rounded-full text-xs transition-all shadow-md shadow-maroon/20 flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            title="Open Full Page CMS Drawer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="text-xs">Page Settings</span>
          </button>

          <Link
            to="/admin/cms"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors flex items-center justify-center"
            title="All Pages CMS Dashboard"
          >
            <Settings className="h-3.5 w-3.5" />
          </Link>
        </div>

        {showSavedToast && (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold pl-2 border-l border-slate-700 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
          </div>
        )}
      </aside>

      {/* Slide-over Drawer for Visual Editing */}
      {drawerOpen && pageData && (
        <PageCMSDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          pageData={pageData}
          onSave={handleSaveAndNotify}
          onReset={resetPage}
        />
      )}
    </>
  );
}
