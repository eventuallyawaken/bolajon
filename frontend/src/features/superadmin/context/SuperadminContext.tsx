import React, { createContext, useContext } from 'react';
import { useSuperadmin } from '../hooks/useSuperadmin';

type SuperadminContextType = ReturnType<typeof useSuperadmin>;

const SuperadminContext = createContext<SuperadminContextType | null>(null);

export const SuperadminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useSuperadmin();
  return (
    <SuperadminContext.Provider value={value}>
      {children}
    </SuperadminContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSuperadminContext = () => {
  const context = useContext(SuperadminContext);
  if (!context) {
    throw new Error('useSuperadminContext must be used within SuperadminProvider');
  }
  return context;
};

export default SuperadminProvider;
