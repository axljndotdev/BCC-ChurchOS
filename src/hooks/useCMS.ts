import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CMSPageData } from '../types';
import { DEFAULT_CMS_PAGES } from '../data/defaultCMSData';
import { getPageContent, updatePageContent, resetPageContent } from '../services/db';

export function useCMS(pageId: string) {
  const { user, profile, isSuperAdmin, isAdmin, isCouncil } = useAuth();
  
  const getInitialData = (): CMSPageData => {
    const fallback = DEFAULT_CMS_PAGES[pageId] || {
      id: pageId,
      title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
      slug: `/${pageId === 'home' ? '' : pageId}`,
      hero: {
        title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920',
        visible: true
      },
      sections: []
    };

    try {
      const cached = localStorage.getItem(`bcc_cms_page_${pageId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...fallback,
          ...parsed,
          id: pageId,
          hero: {
            ...fallback.hero,
            ...(parsed.hero || {})
          },
          sections: (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0)
            ? parsed.sections
            : fallback.sections,
          customBlocks: Array.isArray(parsed.customBlocks) ? parsed.customBlocks : []
        };
      }
    } catch (e) {
      // ignore
    }

    return fallback;
  };

  const [pageData, setPageData] = useState<CMSPageData>(getInitialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPageContent(pageId);
      setPageData(data);
    } catch (err: any) {
      console.error(`Error loading CMS data for ${pageId}:`, err);
      setError(err?.message || 'Failed to load page content');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const savePage = async (updatedData: Partial<CMSPageData>): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      const merged: CMSPageData = {
        ...pageData,
        ...updatedData,
        id: pageId,
        hero: {
          ...pageData.hero,
          ...(updatedData.hero || {})
        },
        sections: updatedData.sections || pageData.sections,
        customBlocks: updatedData.customBlocks !== undefined ? updatedData.customBlocks : pageData.customBlocks
      };

      await updatePageContent(pageId, merged, {
        uid: user?.uid,
        displayName: profile?.displayName || user?.displayName || 'Super Admin',
        email: user?.email || undefined
      });

      setPageData(merged);
      return true;
    } catch (err: any) {
      console.error(`Error saving CMS data for ${pageId}:`, err);
      setError(err?.message || 'Failed to save page changes');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetPage = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      const defaultData = await resetPageContent(pageId);
      setPageData(defaultData);
      return true;
    } catch (err: any) {
      console.error(`Error resetting CMS data for ${pageId}:`, err);
      setError(err?.message || 'Failed to reset page to defaults');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    pageData,
    setPageData,
    loading,
    saving,
    error,
    savePage,
    resetPage,
    refresh: fetchContent,
    canEdit: Boolean(isSuperAdmin || isAdmin || isCouncil),
    isSuperAdmin: Boolean(isSuperAdmin)
  };
}
