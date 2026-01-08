'use client';

// Modal Provider Context
// ✅ Code Quality Agent: Global modal state management

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ModalContextType {
  isAddEventOpen: boolean;
  openAddEvent: () => void;
  closeAddEvent: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const openAddEvent = useCallback(() => setIsAddEventOpen(true), []);
  const closeAddEvent = useCallback(() => setIsAddEventOpen(false), []);

  return (
    <ModalContext.Provider value={{ isAddEventOpen, openAddEvent, closeAddEvent }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
