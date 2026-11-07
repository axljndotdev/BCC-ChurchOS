import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface CMSEditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (active: boolean) => void;
  canEdit: boolean;
}

const CMSEditContext = createContext<CMSEditContextType>({
  isEditMode: true,
  toggleEditMode: () => {},
  setEditMode: () => {},
  canEdit: false
});

export const CMSEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const canEdit = !!(isSuperAdmin || isAdmin);
  
  // Default to true for super admin so edit buttons are immediately available
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  useEffect(() => {
    if (canEdit) {
      const saved = localStorage.getItem('bcc_cms_edit_mode');
      if (saved !== null) {
        setIsEditMode(saved === 'true');
      } else {
        setIsEditMode(true);
      }
    }
  }, [canEdit]);

  const toggleEditMode = () => {
    setIsEditMode(prev => {
      const next = !prev;
      localStorage.setItem('bcc_cms_edit_mode', String(next));
      return next;
    });
  };

  const setEditMode = (active: boolean) => {
    setIsEditMode(active);
    localStorage.setItem('bcc_cms_edit_mode', String(active));
  };

  return (
    <CMSEditContext.Provider value={{ isEditMode: canEdit && isEditMode, toggleEditMode, setEditMode, canEdit }}>
      {children}
    </CMSEditContext.Provider>
  );
};

export const useCMSEdit = () => useContext(CMSEditContext);
