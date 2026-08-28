import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Edit3, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCMS } from '../../hooks/useCMS';
import PageCMSDrawer from './PageCMSDrawer';

interface VisualCMSBarProps {
  pageId: string;
  pageName?: string;
}

export default function VisualCMSBar({ pageId, pageName }: VisualCMSBarProps) {
  const { isSuperAdmin, isAdmin } = useAuth();
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
      {/* Floating Super Admin Bar */}
      <aside 
        aria-label="Super Admin CMS Bar"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-4 transition-all hover:scale-[1.01] animate-in fade-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
          <div className="p-1.5 bg-maroon text-white rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Super Admin CMS
            </span>
            <span className="text-[11px] font-bold text-slate-200">
              Editing: {pageName || pageData?.title || pageId}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            disabled={loading}
            className="px-3.5 py-1.5 bg-maroon hover:bg-maroon/90 text-white font-bold rounded-full text-xs transition-all shadow-md shadow-maroon/20 flex items-center gap-1.5 active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Page (Text, Photos, Buttons)</span>
          </button>

          <Link
            to="/admin/cms"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-full text-xs transition-colors flex items-center gap-1"
            title="Open Full CMS Center"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden md:inline">CMS Center</span>
          </Link>
        </div>

        {showSavedToast && (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold pl-2 border-l border-slate-700 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved Live!
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
