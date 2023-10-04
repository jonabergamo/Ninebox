"use client";
import Modal from "@/components/modals/modals";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface IModalContext {
  showModal: boolean;
  modalType: string | null;
  modalId: string | number | null;
  toggleModal: (type?: string, id?: string | number) => void;
  closeModal: () => void;
}

const ModalContext = createContext<IModalContext | undefined>(undefined);

export const useModal = (): IModalContext => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal deve ser usado dentro de um ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | number | null>(null);

  const toggleModal = (type?: string, id?: number | string) => {
    setShowModal(!showModal);
    setModalType(type || null);
    if (id) {
      setModalId(id);
    } else {
      setModalId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const contextValue: IModalContext = {
    showModal,
    modalType,
    toggleModal,
    closeModal,
    modalId,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};
