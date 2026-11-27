import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { parentApi } from '../api';
import type { ParentChild } from '../types';

interface ParentPortalContextValue {
  childrenList: ParentChild[];
  activeChild: ParentChild | null;
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  isLoadingChildren: boolean;
  refreshChildren: () => Promise<void>;
}

const ParentPortalContext = createContext<ParentPortalContextValue | null>(null);

export const ParentPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<ParentChild[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  const refreshChildren = useCallback(async () => {
    try {
      setIsLoadingChildren(true);
      const list = await parentApi.getChildren();
      setChildrenList(list);
      setActiveChildId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev;
        return list[0]?.id || '';
      });
    } catch {
      toast.error('Farzandlar ma’lumotini yuklashda xatolik');
    } finally {
      setIsLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    void refreshChildren();
  }, [refreshChildren]);

  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0] || null;

  return (
    <ParentPortalContext.Provider
      value={{
        childrenList,
        activeChild,
        activeChildId: activeChild?.id || '',
        setActiveChildId,
        isLoadingChildren,
        refreshChildren,
      }}
    >
      {children}
    </ParentPortalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useParentPortal() {
  const ctx = useContext(ParentPortalContext);
  if (!ctx) {
    throw new Error('useParentPortal must be used within ParentPortalProvider');
  }
  return ctx;
}
