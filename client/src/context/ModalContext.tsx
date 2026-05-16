import React, { createContext, useContext, useState } from "react";

interface ModalContextType {
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  openRegisterModal: () => {},
  closeRegisterModal: () => {},
});

export const useModal = () => useContext(ModalContext);

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const value = {
    isLoginModalOpen,
    isRegisterModalOpen,
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
