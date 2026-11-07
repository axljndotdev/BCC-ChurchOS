import React, { useState, useEffect } from 'react';
import { 
  X, Save, RotateCcw, Image as ImageIcon, Plus, Trash2,
  Sparkles, Layers, FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  ExternalLink, MoveUp, MoveDown, Camera
} from 'lucide-react';
import { CMSPageData, CMSSection, CMSCard } from '../../types';
import ButtonEditor from './ButtonEditor';
import ImagePickerModal from './ImagePickerModal';

interface PageCMSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pageData: CMSPageData;
  onSave: (data: Partial<CMSPageData>) => Promise<boolean>;
  onReset: () => Promise<boolean>;
}

export default function PageCMSDrawer({
  isOpen,
  onClose,
  pageData,
  onSave,
  onReset
}: PageCMSDrawerProps) {
  const [formData, setFormData] = useState<CMSPageData>(pageData);
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'photos' | 'settings'>('hero');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Image picker modal state
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<{
    type: 'hero' | 'section' | 'card' | 'gallery';
    sectionId?: string;
    cardId?: string;
    galleryIndex?: number;
    currentUrl?: string;
    title?: string;
  } | null>(null);

  useEffect(() => {
    setFormData(pageData);
    if (pageData.sections?.length > 0 && !expandedSection) {
      setExpandedSection(pageData.sections[0].id);
    }
  }, [pageData]);

  if (!isOpen) return null;

  const handleHeroChange = (key: keyof CMSPageData['hero'], value: any) => {
    setFormData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [key]: value
      }
    }));
  };

  const handleSectionChange = (sectionId: string, updates: Partial<CMSSection>) => {
    setFormData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(sec => 
        sec.id === sectionId ? { ...sec, ...updates } : sec
      )
    }));
  };

  const handleCardChange = (sectionId: string, cardId: string, updates: Partial<CMSCard>) => {
    setFormData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(sec => {
        if (sec.id !== sectionId) return sec;
        const currentCards = sec.cards || [];
        return {
          ...sec,
          cards: currentCards.map(c => c.id === cardId ? { ...c, ...updates } : c)
        };
      })
    }));
  };

  const handleAddCard = (sectionId: string) => {
    const newCard: CMSCard = {
      id: `card-${Date.now()}`,
      title: 'New Card Highlight',
      description: 'Enter a clear description of this key pillar or feature.',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      iconName: 'Sparkles',
      buttonLabel: 'Learn More',
      buttonUrl: '/about',
      buttonVisible: false
    };

    setFormData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(sec => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          cards: [...(sec.cards || []), newCard]
        };
      })
    }));
  };

  const handleDeleteCard = (sectionId: string, cardId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(sec => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          cards: (sec.cards || []).filter(c => c.id !== cardId)
        };
      })
    }));
  };

  const handleAddSection = () => {
    const newSection: CMSSection = {
      id: `section-${Date.now()}`,
      name: 'New Custom Content Section',
      title: 'Section Headline',
      subtitle: 'Inspiring subtitle text',
      content: 'Write your content paragraph here describing this aspect of the church ministry or mission.',
      badge: 'Highlights',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
      visible: true,
      type: 'story',
      primaryButton: {
        label: 'Explore More',
        url: '/about',
        visible: true,
        style: 'primary'
      }
    };

    setFormData(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection]
    }));
    setExpandedSection(newSection.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!window.confirm('Are you sure you want to remove this section?')) return;
    setFormData(prev => ({
      ...prev,
      sections: (prev.sections || []).filter(sec => sec.id !== sectionId)
    }));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...(formData.sections || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const handleOpenImagePicker = (
    type: 'hero' | 'section' | 'card' | 'gallery',
    currentUrl: string,
    sectionId?: string,
    cardId?: string,
    galleryIndex?: number,
    title?: string
  ) => {
    setImagePickerTarget({ type, currentUrl, sectionId, cardId, galleryIndex, title });
    setImagePickerOpen(true);
  };

  const handleSelectImage = (imageUrl: string) => {
    if (!imagePickerTarget) return;

    if (imagePickerTarget.type === 'hero') {
      handleHeroChange('imageUrl', imageUrl);
    } else if (imagePickerTarget.type === 'section' && imagePickerTarget.sectionId) {
      handleSectionChange(imagePickerTarget.sectionId, { imageUrl });
    } else if (imagePickerTarget.type === 'card' && imagePickerTarget.sectionId && imagePickerTarget.cardId) {
      handleCardChange(imagePickerTarget.sectionId, imagePickerTarget.cardId, { imageUrl });
    } else if (imagePickerTarget.type === 'gallery') {
      const currentGallery = formData.galleryImages || [];
      if (typeof imagePickerTarget.galleryIndex === 'number') {
        const updated = [...currentGallery];
        if (imageUrl) {
          updated[imagePickerTarget.galleryIndex] = imageUrl;
        } else {
          updated.splice(imagePickerTarget.galleryIndex, 1);
        }
        setFormData(prev => ({ ...prev, galleryImages: updated }));
      } else if (imageUrl) {
        setFormData(prev => ({ ...prev, galleryImages: [...currentGallery, imageUrl] }));
      }
    }

    setImagePickerTarget(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      const success = await onSave(formData);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('Failed to save changes. Please check permissions.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset this page back to original factory defaults? Any custom edits on this page will be replaced.')) {
      return;
    }
    try {
      setIsSaving(true);
      await onReset();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage('Failed to reset page.');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute total photos count for this page
  const totalPhotosCount = 1 + // Hero
    (formData.sections || []).filter(s => s.imageUrl).length +
    (formData.sections || []).reduce((acc, s) => acc + (s.cards || []).filter(c => c.imageUrl).length, 0) +
    (formData.galleryImages || []).length;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
        <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-maroon rounded-2xl text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Super Admin CMS
                  </span>
                  <span className="text-xs text-slate-400">Editing: <strong>{pageData.title}</strong></span>
                </div>
                <h2 className="text-xl font-display font-bold text-white mt-0.5">
                  Page Content & Visual Editor
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Close Editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar with Photos & Media Tab */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('hero')}
              className={`py-3.5 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'hero'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Hero Banner
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-3.5 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'sections'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Sections ({formData.sections?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-3.5 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Camera className="h-3.5 w-3.5" /> Photos & Media ({totalPhotosCount})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3.5 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-maroon text-maroon bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Settings
            </button>
          </div>

          {/* Feedback Banners */}
          {saveSuccess && (
            <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-medium shrink-0 animate-in slide-in-from-top">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Page content and photos updated live to church website!</span>
            </div>
          )}

          {errorMessage && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-medium shrink-0 animate-in slide-in-from-top">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scrollable Content Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            {/* TAB 1: HERO & BANNER */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Hero Section Display</h4>
                    <p className="text-[11px] text-slate-500">Toggle whether the top banner hero is visible on this page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHeroChange('visible', formData.hero.visible !== false ? false : true)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                      formData.hero.visible !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {formData.hero.visible !== false ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                {/* Hero Badge */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hero Badge / Pill Text
                  </label>
                  <input
                    type="text"
                    value={formData.hero.badge || ''}
                    onChange={(e) => handleHeroChange('badge', e.target.value)}
                    placeholder="e.g. Welcome to Bethesda"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-maroon focus:outline-none"
                  />
                </div>

                {/* Hero Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hero Main Headline (Title)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.title || ''}
                    onChange={(e) => handleHeroChange('title', e.target.value)}
                    placeholder="e.g. About Bethesda"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-maroon focus:outline-none"
                  />
                </div>

                {/* Hero Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hero Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.subtitle || ''}
                    onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                    placeholder="e.g. A Sanctuary for the Soul"
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-maroon focus:outline-none"
                  />
                </div>

                {/* Hero Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hero Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={formData.hero.description || ''}
                    onChange={(e) => handleHeroChange('description', e.target.value)}
                    placeholder="Write a welcoming description..."
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-maroon focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Hero Background Photo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Hero Background Image
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenImagePicker('hero', formData.hero.imageUrl, undefined, undefined, undefined, 'Edit Hero Background Photo')}
                      className="px-3 py-1 bg-maroon text-white hover:bg-maroon/90 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <ImageIcon className="h-3.5 w-3.5" /> Choose / Upload Photo
                    </button>
                  </div>

                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 group">
                    <img
                      src={formData.hero.imageUrl || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920'}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleOpenImagePicker('hero', formData.hero.imageUrl, undefined, undefined, undefined, 'Edit Hero Background Photo')}
                        className="px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold shadow-xl hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4 text-maroon" /> Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.hero.imageUrl || ''}
                      onChange={(e) => handleHeroChange('imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono"
                    />
                  </div>
                </div>

                {/* Hero Buttons */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Hero Action Buttons</h4>
                  {formData.hero.primaryButton && (
                    <ButtonEditor
                      label="Primary Button"
                      button={formData.hero.primaryButton}
                      onChange={(btn) => handleHeroChange('primaryButton', btn)}
                    />
                  )}
                  {formData.hero.secondaryButton && (
                    <ButtonEditor
                      label="Secondary Button"
                      button={formData.hero.secondaryButton}
                      onChange={(btn) => handleHeroChange('secondaryButton', btn)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SECTIONS */}
            {activeTab === 'sections' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Page Content Sections</h3>
                    <p className="text-xs text-slate-500">Edit titles, text, photos, quotes, and interactive cards.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3.5 py-1.5 bg-maroon text-white font-bold rounded-full text-xs hover:bg-maroon/90 shadow-md shadow-maroon/20 flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Section
                  </button>
                </div>

                {(!formData.sections || formData.sections.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500 mb-3">No content sections on this page yet.</p>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-4 py-2 bg-maroon text-white font-bold rounded-full text-xs hover:bg-maroon/90 inline-flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add First Section
                    </button>
                  </div>
                ) : (
                  formData.sections.map((section, sIndex) => {
                    const isExpanded = expandedSection === section.id;
                    return (
                      <div 
                        key={section.id} 
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                      >
                        {/* Section Header Accordion */}
                        <div 
                          className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                            isExpanded ? 'bg-slate-100/80 border-b border-slate-200' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center">
                              {sIndex + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                {section.name || section.title || `Section #${sIndex + 1}`}
                                {section.visible === false && (
                                  <span className="text-[10px] text-slate-400 font-normal">(Hidden)</span>
                                )}
                              </h4>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                Type: {section.type || 'standard'} &bull; {section.cards?.length || 0} cards
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sIndex, 'up')}
                              disabled={sIndex === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move section up"
                            >
                              <MoveUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sIndex, 'down')}
                              disabled={sIndex === formData.sections.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move section down"
                            >
                              <MoveDown className="h-3.5 w-3.5" />
                            </button>
                            <div className="p-1 text-slate-400">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Section Body */}
                        {isExpanded && (
                          <div className="p-5 space-y-5 bg-white">
                            {/* Section Visibility & Type */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                  Section Visibility
                                </label>
                                <select
                                  value={section.visible !== false ? 'visible' : 'hidden'}
                                  onChange={(e) => handleSectionChange(section.id, { visible: e.target.value === 'visible' })}
                                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon"
                                >
                                  <option value="visible">Visible on Page</option>
                                  <option value="hidden">Hidden / Draft</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                  Layout Template
                                </label>
                                <select
                                  value={section.type || 'story'}
                                  onChange={(e) => handleSectionChange(section.id, { type: e.target.value as any })}
                                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon"
                                >
                                  <option value="story">Story & Image</option>
                                  <option value="cards">Highlight Cards</option>
                                  <option value="values">Core Values Grid</option>
                                  <option value="quote">Quote & Statement</option>
                                  <option value="cta">Call to Action Banner</option>
                                  <option value="schedule">Schedule / Timeline</option>
                                  <option value="info">Notice / Info Block</option>
                                </select>
                              </div>
                            </div>

                            {/* Section Names & Badges */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                  Section CMS Label
                                </label>
                                <input
                                  type="text"
                                  value={section.name || ''}
                                  onChange={(e) => handleSectionChange(section.id, { name: e.target.value })}
                                  placeholder="e.g. Core Values Section"
                                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                  Section Pill / Badge
                                </label>
                                <input
                                  type="text"
                                  value={section.badge || ''}
                                  onChange={(e) => handleSectionChange(section.id, { badge: e.target.value })}
                                  placeholder="e.g. Our Purpose"
                                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon"
                                />
                              </div>
                            </div>

                            {/* Section Headline & Subtitle */}
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                Section Headline (Title)
                              </label>
                              <input
                                type="text"
                                value={section.title || ''}
                                onChange={(e) => handleSectionChange(section.id, { title: e.target.value })}
                                placeholder="e.g. A community where everyone is seen, known, and loved."
                                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                Section Subtitle (Optional)
                              </label>
                              <input
                                type="text"
                                value={section.subtitle || ''}
                                onChange={(e) => handleSectionChange(section.id, { subtitle: e.target.value })}
                                placeholder="e.g. Our Foundational Pillars"
                                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon"
                              />
                            </div>

                            {/* Section Content Paragraph */}
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                Section Description / Body Paragraph
                              </label>
                              <textarea
                                rows={3}
                                value={section.content || ''}
                                onChange={(e) => handleSectionChange(section.id, { content: e.target.value })}
                                placeholder="Section descriptive content..."
                                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon leading-relaxed"
                              />
                            </div>

                            {/* Section Feature Photo */}
                            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                  <Camera className="h-3.5 w-3.5 text-maroon" /> Section Feature Photo
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleOpenImagePicker('section', section.imageUrl || '', section.id, undefined, undefined, `Edit ${section.name || section.title} Photo`)}
                                  className="px-2.5 py-1 text-[11px] bg-maroon text-white hover:bg-maroon/90 rounded-lg transition-colors font-medium flex items-center gap-1"
                                >
                                  <ImageIcon className="h-3 w-3" /> Select / Upload
                                </button>
                              </div>
                              {section.imageUrl ? (
                                <div className="relative aspect-video max-h-44 rounded-xl overflow-hidden border border-slate-200 group">
                                  <img src={section.imageUrl} alt="Section" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenImagePicker('section', section.imageUrl || '', section.id, undefined, undefined, `Edit ${section.name || section.title} Photo`)}
                                      className="px-3 py-1.5 bg-white text-slate-900 rounded-full text-xs font-bold shadow-lg"
                                    >
                                      Change Photo
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSectionChange(section.id, { imageUrl: '' })}
                                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                                      title="Remove Image"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                  <p className="text-[11px] text-slate-400">No feature image assigned to this section.</p>
                                </div>
                              )}
                            </div>

                            {/* Optional Section Quote */}
                            {section.quote && (
                              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                  Quote & Statement
                                </label>
                                <textarea
                                  rows={2}
                                  value={section.quote.text || ''}
                                  onChange={(e) => handleSectionChange(section.id, {
                                    quote: { ...section.quote!, text: e.target.value }
                                  })}
                                  placeholder="Quote text..."
                                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-amber-200 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={section.quote.author || ''}
                                  onChange={(e) => handleSectionChange(section.id, {
                                    quote: { ...section.quote!, author: e.target.value }
                                  })}
                                  placeholder="Author / Attribution (e.g. Pastor's Pen)"
                                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-amber-200 focus:outline-none font-medium"
                                />
                              </div>
                            )}

                            {/* Section Primary Button */}
                            {section.primaryButton && (
                              <ButtonEditor
                                label="Section Call to Action Button"
                                button={section.primaryButton}
                                onChange={(btn) => handleSectionChange(section.id, { primaryButton: btn })}
                              />
                            )}

                            {/* Cards / Values / Items in Section */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                  Section Items & Cards ({section.cards?.length || 0})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddCard(section.id)}
                                  className="px-2.5 py-1 bg-maroon/10 text-maroon hover:bg-maroon hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" /> Add Card
                                </button>
                              </div>

                              {section.cards && section.cards.map((card, cIndex) => (
                                <div key={card.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Item #{cIndex + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCard(section.id, card.id)}
                                      className="text-slate-400 hover:text-red-600 p-1"
                                      title="Delete Item"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    value={card.title || ''}
                                    onChange={(e) => handleCardChange(section.id, card.id, { title: e.target.value })}
                                    placeholder="Card Title"
                                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white rounded-lg border border-slate-200"
                                  />

                                  <textarea
                                    rows={2}
                                    value={card.description || ''}
                                    onChange={(e) => handleCardChange(section.id, card.id, { description: e.target.value })}
                                    placeholder="Card description or statement..."
                                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200"
                                  />

                                  {/* Card Image Selector */}
                                  <div className="flex items-center gap-3 pt-1 border-t border-slate-200/60">
                                    {card.imageUrl ? (
                                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                        <img src={card.imageUrl} alt="Card Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </div>
                                    ) : (
                                      <div className="w-14 h-14 rounded-lg bg-slate-200/60 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                                        <ImageIcon className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenImagePicker('card', card.imageUrl || '', section.id, card.id, undefined, `Edit Photo for ${card.title}`)}
                                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-maroon text-[11px] font-bold text-slate-700 hover:text-maroon rounded-lg transition-colors flex items-center gap-1"
                                        >
                                          <Camera className="h-3 w-3 text-maroon" /> {card.imageUrl ? 'Change Photo' : 'Add Photo'}
                                        </button>
                                        {card.imageUrl && (
                                          <button
                                            type="button"
                                            onClick={() => handleCardChange(section.id, card.id, { imageUrl: '' })}
                                            className="text-xs text-red-500 hover:underline"
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-400">Card thumbnail or highlight photo</p>
                                    </div>
                                  </div>

                                  {card.buttonVisible !== false && card.buttonLabel && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={card.buttonLabel}
                                        onChange={(e) => handleCardChange(section.id, card.id, { buttonLabel: e.target.value })}
                                        placeholder="Button label"
                                        className="px-2 py-1 text-[11px] bg-white rounded border border-slate-200"
                                      />
                                      <input
                                        type="text"
                                        value={card.buttonUrl || ''}
                                        onChange={(e) => handleCardChange(section.id, card.id, { buttonUrl: e.target.value })}
                                        placeholder="Link /about"
                                        className="px-2 py-1 text-[11px] bg-white rounded border border-slate-200"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Section Footer: Delete Section */}
                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section.id)}
                                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remove Section
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: PHOTOS & MEDIA (CENTRAL PAGE PHOTO MANAGER) */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-maroon" /> Page Photo & Media Manager
                  </h3>
                  <p className="text-xs text-slate-500">
                    Easily review, replace, upload, and edit all photography across this page in one visual studio.
                  </p>
                </div>

                {/* 1. Hero Banner Photo */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Top Banner
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">Hero Background Photo</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenImagePicker('hero', formData.hero.imageUrl, undefined, undefined, undefined, 'Edit Hero Banner Photo')}
                      className="px-3 py-1.5 bg-maroon text-white hover:bg-maroon/90 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <ImageIcon className="h-3.5 w-3.5" /> Change Photo
                    </button>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-900 max-h-48">
                    <img
                      src={formData.hero.imageUrl || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920'}
                      alt="Hero"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenImagePicker('hero', formData.hero.imageUrl, undefined, undefined, undefined, 'Edit Hero Banner Photo')}
                        className="px-3.5 py-1.5 bg-white text-slate-900 font-bold rounded-full text-xs shadow-lg"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Section Feature Photos */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Section Feature Photos
                  </h4>
                  {(formData.sections || []).map((sec, idx) => (
                    <div key={sec.id} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {sec.imageUrl ? (
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                            <img src={sec.imageUrl} alt={sec.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{sec.name || sec.title || `Section #${idx + 1}`}</p>
                          <p className="text-[11px] text-slate-400 truncate">{sec.badge || sec.subtitle || 'Feature section'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenImagePicker('section', sec.imageUrl || '', sec.id, undefined, undefined, `Edit ${sec.name || sec.title} Photo`)}
                          className="px-3 py-1 bg-slate-100 hover:bg-maroon hover:text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Camera className="h-3 w-3" /> {sec.imageUrl ? 'Replace' : 'Upload'}
                        </button>
                        {sec.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleSectionChange(sec.id, { imageUrl: '' })}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Remove Photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. Cards & Pillars Photos */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cards & Item Photos
                  </h4>
                  {(formData.sections || []).flatMap(sec => 
                    (sec.cards || []).map(card => ({ card, sectionId: sec.id, sectionName: sec.name || sec.title }))
                  ).length === 0 ? (
                    <p className="text-xs text-slate-400">No cards in this page's sections.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(formData.sections || []).flatMap(sec => 
                        (sec.cards || []).map(card => (
                          <div key={card.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                            {card.imageUrl ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-200/60 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{card.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenImagePicker('card', card.imageUrl || '', sec.id, card.id, undefined, `Edit ${card.title} Photo`)}
                                  className="text-[10px] font-bold text-maroon hover:underline"
                                >
                                  {card.imageUrl ? 'Change' : 'Add Photo'}
                                </button>
                                {card.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleCardChange(sec.id, card.id, { imageUrl: '' })}
                                    className="text-[10px] text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Page Gallery / Media Reel Photos */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Custom Page Media Gallery</h4>
                      <p className="text-[11px] text-slate-500">Add custom showcase photography for this page.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenImagePicker('gallery', '', undefined, undefined, undefined, 'Add New Gallery Photo')}
                      className="px-3 py-1 bg-maroon/10 text-maroon hover:bg-maroon hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Photo
                    </button>
                  </div>

                  {(!formData.galleryImages || formData.galleryImages.length === 0) ? (
                    <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">No extra gallery photos added yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {formData.galleryImages.map((imgUrl, gIdx) => (
                        <div key={gIdx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                          <img src={imgUrl} alt={`Gallery #${gIdx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenImagePicker('gallery', imgUrl, undefined, undefined, gIdx, `Edit Gallery Photo #${gIdx + 1}`)}
                              className="p-1.5 bg-white text-slate-900 rounded-full hover:bg-slate-100"
                              title="Replace"
                            >
                              <Camera className="h-3 w-3 text-maroon" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(formData.galleryImages || [])];
                                updated.splice(gIdx, 1);
                                setFormData(prev => ({ ...prev, galleryImages: updated }));
                              }}
                              className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SETTINGS & METADATA */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Page Name / Display Title
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-maroon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Page URL Route / Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 font-mono"
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Reset Page to Factory Defaults
                  </h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    If you ever wish to restore the standard church template for this page, you can reset it anytime.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-2 px-4 py-2 bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset Page Content
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer with Save Buttons */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <a
              href={formData.slug || '/'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Live Page
            </a>

            <div className="flex items-center gap-3">
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
                className="px-6 py-2.5 bg-maroon text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-maroon/90 shadow-lg shadow-maroon/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Publishing Live...' : 'Publish Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <ImagePickerModal
          isOpen={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelectImage={handleSelectImage}
          currentImageUrl={imagePickerTarget?.currentUrl || ''}
          title={imagePickerTarget?.title || 'Select or Upload Photo'}
        />
      )}
    </>
  );
}
