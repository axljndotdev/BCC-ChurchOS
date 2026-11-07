import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  Globe, 
  Lock, 
  FileSpreadsheet,
  FileCode,
  Music,
  BookOpen,
  Calendar
} from 'lucide-react';
import { 
  getResources, 
  addResource, 
  updateResource, 
  deleteResource 
} from '../services/db';
import { ResourceItem } from '../types';
import { formatDate, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const RESOURCE_TYPES = [
  'PDF Document',
  'Sunday Bulletin',
  'Study Guide',
  'Sermon Slides',
  'Ministry Handbook',
  'Audio / Worship MP3',
  'General File'
];

export default function AdminResources() {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<'all' | 'public' | 'members'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'public' as 'public' | 'members',
    type: 'PDF Document',
    url: '',
    fileName: '',
    size: '1.2 MB'
  });

  // Toasts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getResources(true); // true = include members-only
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setErrorMessage('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      category: 'public',
      type: 'PDF Document',
      url: '',
      fileName: '',
      size: '1.0 MB'
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (res: ResourceItem) => {
    setEditingResource(res);
    setFormData({
      title: res.title,
      description: res.description,
      category: res.category,
      type: res.type,
      url: res.url,
      fileName: res.fileName || '',
      size: res.size || '1.0 MB'
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      setErrorMessage('Please provide a title and file link/URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingResource) {
        await updateResource(editingResource.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          url: formData.url,
          fileName: formData.fileName || formData.title,
          size: formData.size
        });
        setSuccessMessage('Resource updated successfully.');
      } else {
        await addResource({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          url: formData.url,
          fileName: formData.fileName || formData.title,
          size: formData.size,
          uploadedBy: user?.uid || 'admin',
          uploadedByName: profile?.displayName || user?.displayName || 'Church Admin'
        });
        setSuccessMessage('Resource added to library.');
      }

      setIsCreateModalOpen(false);
      setEditingResource(null);
      await fetchResources();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (error) {
      console.error('Error saving resource:', error);
      setErrorMessage('Failed to save resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async (res: ResourceItem) => {
    setProcessingId(res.id);
    setErrorMessage(null);
    try {
      await deleteResource(res.id);
      setResources(prev => prev.filter(r => r.id !== res.id));
      setResourceToDelete(null);
      setSuccessMessage('Resource deleted.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (error) {
      console.error('Error deleting resource:', error);
      setErrorMessage('Failed to delete resource.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesCategory = filterCategory === 'all' || res.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      res.title.toLowerCase().includes(q) ||
      res.description.toLowerCase().includes(q) ||
      res.type.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 relative">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-emerald-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 bg-rose-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-rose-700 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 text-rose-300" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 text-rose-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/70 border border-amber-300/60 rounded-full text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-3">
            <BookOpen className="h-3 w-3 text-amber-600" />
            <span>Document & Download Management</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Resource Library</h1>
          <p className="text-slate-500 font-light mt-1">
            Manage church bulletins, discipleship study materials, Sunday slides, and ministry files.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/resources"
            target="_blank"
            className="px-4 py-2.5 bg-white border border-[#E8D5B5] text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:text-maroon hover:border-maroon transition-all flex items-center gap-2 shadow-xs min-h-[42px]"
          >
            <span>Public View</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#7A121D] hover:bg-[#5C0612] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-maroon/20 min-h-[42px]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </header>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Resources</p>
          <p className="text-3xl font-display font-bold text-slate-900">{resources.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100/60 shadow-xs">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Public Access</p>
          <p className="text-3xl font-display font-bold text-emerald-900">{resources.filter(r => r.category === 'public').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100/60 shadow-xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Members Only</p>
          <p className="text-3xl font-display font-bold text-amber-900">{resources.filter(r => r.category === 'members').length}</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {(['all', 'public', 'members'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                filterCategory === cat
                  ? "bg-white text-maroon shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {cat === 'all' ? 'All Files' : cat === 'public' ? 'Public' : 'Members Only'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resource files..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-maroon focus:outline-none"
          />
        </div>
      </div>

      {/* Resources Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-maroon animate-spin" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No resources found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-[#E8D5B5] transition-all flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                    res.category === 'public'
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>
                    {res.category === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {res.category === 'public' ? 'Public File' : 'Members Only'}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {res.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base line-clamp-1">{res.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 font-light leading-relaxed">
                  {res.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 text-[11px]">
                  <span>{res.size || '1 MB'}</span>
                  <span>•</span>
                  <span>{res.downloadCount || 0} downloads</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-50 text-slate-600 hover:text-maroon hover:bg-[#FAF6EE] rounded-xl transition-all"
                    title="Preview Link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleOpenEdit(res)}
                    className="p-2 bg-slate-50 text-slate-600 hover:text-maroon hover:bg-[#FAF6EE] rounded-xl transition-all"
                    title="Edit Resource"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setResourceToDelete(res)}
                    disabled={processingId === res.id}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Resource"
                  >
                    {processingId === res.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-slate-900 font-display">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sunday Bulletin - Oct 2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Access Level
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                  >
                    <option value="public">Public (Anyone)</option>
                    <option value="members">Members Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Resource Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                  >
                    {RESOURCE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  File Download URL / Link *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://drive.google.com/... or direct link"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    File Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="bulletin-2026.pdf"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g. 2.4 MB"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of what this document contains..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#7A121D] hover:bg-[#5C0612] transition-all uppercase tracking-wider shadow-md shadow-maroon/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <span>{editingResource ? 'Update Resource' : 'Publish Resource'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 font-display">Delete Resource?</h3>
                <p className="text-xs text-slate-500">This document will be removed from the church download library.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <p className="text-sm font-bold text-slate-900">{resourceToDelete.title}</p>
              <p className="text-xs text-slate-500 mt-1">{resourceToDelete.type} • {resourceToDelete.category}</p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setResourceToDelete(null)}
                disabled={processingId === resourceToDelete.id}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDelete(resourceToDelete)}
                disabled={processingId === resourceToDelete.id}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {processingId === resourceToDelete.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
