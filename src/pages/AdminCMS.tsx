import { useState, useEffect } from 'react';
import { 
  Sparkles, Search, Layers, Edit3, ExternalLink, RotateCcw, 
  Image as ImageIcon, CheckCircle2, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CMSPageData } from '../types';
import { getAllCMSPages, updatePageContent, resetPageContent } from '../services/db';
import { DEFAULT_CMS_PAGES } from '../data/defaultCMSData';
import PageCMSDrawer from '../components/cms/PageCMSDrawer';

interface PageCategory {
  id: string;
  name: string;
  pageIds: string[];
}

const PAGE_CATEGORIES: PageCategory[] = [
  {
    id: 'all',
    name: 'All Pages',
    pageIds: Object.keys(DEFAULT_CMS_PAGES)
  },
  {
    id: 'main',
    name: 'Main Public Pages',
    pageIds: ['home', 'about', 'membership', 'give', 'contact']
  },
  {
    id: 'ministry',
    name: 'Fellowship & Community',
    pageIds: ['ministries', 'activities', 'prayer']
  },
  {
    id: 'media',
    name: 'Media & Teaching',
    pageIds: ['live', 'sermons', 'resources', 'gallery', 'blogs']
  },
  {
    id: 'global',
    name: 'Global Elements',
    pageIds: ['footer']
  }
];

export default function AdminCMS() {
  const { user, profile, isSuperAdmin, isAdmin } = useAuth();
  const [pages, setPages] = useState<Record<string, CMSPageData>>(DEFAULT_CMS_PAGES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPageForEdit, setSelectedPageForEdit] = useState<CMSPageData | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await getAllCMSPages();
      setPages(data);
    } catch (err) {
      console.error('Error fetching CMS pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSavePage = async (pageData: Partial<CMSPageData>): Promise<boolean> => {
    if (!selectedPageForEdit) return false;
    try {
      await updatePageContent(selectedPageForEdit.id, pageData, {
        uid: user?.uid,
        displayName: profile?.displayName || user?.displayName || 'Super Admin',
        email: user?.email || undefined
      });

      setPages(prev => ({
        ...prev,
        [selectedPageForEdit.id]: {
          ...prev[selectedPageForEdit.id],
          ...pageData
        } as CMSPageData
      }));

      setActionSuccess(`Saved updates to ${selectedPageForEdit.title}!`);
      setTimeout(() => setActionSuccess(null), 3000);
      return true;
    } catch (err) {
      console.error('Failed to save page:', err);
      return false;
    }
  };

  const handleResetPage = async (): Promise<boolean> => {
    if (!selectedPageForEdit) return false;
    try {
      const defaultData = await resetPageContent(selectedPageForEdit.id);
      setPages(prev => ({
        ...prev,
        [selectedPageForEdit.id]: defaultData
      }));
      setSelectedPageForEdit(defaultData);
      setActionSuccess(`Reset ${selectedPageForEdit.title} to default!`);
      setTimeout(() => setActionSuccess(null), 3000);
      return true;
    } catch (err) {
      console.error('Failed to reset page:', err);
      return false;
    }
  };

  const currentCategory = PAGE_CATEGORIES.find(c => c.id === activeCategory) || PAGE_CATEGORIES[0];

  const filteredPageList = Object.values(pages).filter(page => {
    const matchesCategory = activeCategory === 'all' || currentCategory.pageIds.includes(page.id);
    const matchesSearch = searchQuery === '' || 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.hero?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-maroon/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-maroon/30 border border-maroon/40 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" /> Super Admin Content Management System (CMS)
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Church Pages & Content Editor
          </h1>
          <p className="text-sm text-slate-300 font-light leading-relaxed">
            Easily update text, photography, hero banners, button links, callout cards, and section statements across every page of Bethesda Community Church without writing code.
          </p>
        </div>

        {/* CMS Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customizable Pages</span>
            <p className="text-2xl font-bold font-display text-white mt-0.5">{Object.keys(DEFAULT_CMS_PAGES).length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Visual Mode</span>
            <p className="text-2xl font-bold font-display text-emerald-400 mt-0.5">Active</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Storage Sync</span>
            <p className="text-2xl font-bold font-display text-amber-400 mt-0.5">Firestore DB</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Access Role</span>
            <p className="text-2xl font-bold font-display text-white mt-0.5">
              {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Administrator' : 'Leader'}
            </p>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          {PAGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-maroon text-white shadow-md shadow-maroon/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon shadow-sm"
          />
        </div>
      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-8 w-8 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading CMS pages and templates...</p>
        </div>
      ) : filteredPageList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-slate-700">No pages matched your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="text-xs text-maroon font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPageList.map((page) => {
            const hasHeroImage = Boolean(page.hero?.imageUrl);
            const sectionCount = page.sections?.length || 0;
            const primaryBtn = page.hero?.primaryButton;
            const secondaryBtn = page.hero?.secondaryButton;

            return (
              <div
                key={page.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Page Hero Image Thumbnail */}
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  {hasHeroImage ? (
                    <img
                      src={page.hero.imageUrl}
                      alt={page.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white rounded-full text-[10px] font-mono font-bold border border-white/10">
                      {page.slug}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-display font-bold text-white leading-tight">
                      {page.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">
                      {page.hero?.subtitle || page.hero?.description || 'Editable church content'}
                    </p>
                  </div>
                </div>

                {/* Page Summary Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Buttons summary */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {primaryBtn?.visible && (
                        <span className="px-2 py-0.5 bg-maroon/10 text-maroon text-[10px] font-bold rounded-md">
                          Button 1: {primaryBtn.label}
                        </span>
                      )}
                      {secondaryBtn?.visible && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                          Button 2: {secondaryBtn.label}
                        </span>
                      )}
                    </div>

                    {/* Section Count */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        {sectionCount} Custom {sectionCount === 1 ? 'Section' : 'Sections'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {page.lastUpdated ? 'Customized' : 'Factory Default'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPageForEdit(page)}
                      className="flex-1 px-4 py-2.5 bg-maroon text-white font-bold rounded-2xl text-xs hover:bg-maroon/90 shadow-md shadow-maroon/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Content</span>
                    </button>

                    {page.slug !== 'footer' && (
                      <a
                        href={page.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors"
                        title="Open page in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Page Editor Drawer */}
      {selectedPageForEdit && (
        <PageCMSDrawer
          isOpen={Boolean(selectedPageForEdit)}
          onClose={() => setSelectedPageForEdit(null)}
          pageData={selectedPageForEdit}
          onSave={handleSavePage}
          onReset={handleResetPage}
        />
      )}
    </div>
  );
}
