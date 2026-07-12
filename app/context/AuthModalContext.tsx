"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';

type ModalType = 'login' | 'register' | null;

type AuthModalContextType = {
  modal: ModalType;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalType>(null);

  const openLogin = () => setModal('login');
  const openRegister = () => setModal('register');
  const closeModal = () => setModal(null);

  return (
    <AuthModalContext.Provider value={{ modal, openLogin, openRegister, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
