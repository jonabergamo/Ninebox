"use client";
import Modal from "@/components/modals/modals";
import { Activity, StudentActivity, StudentActivityModal } from "@/types";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface IModalContext {
  showModal: boolean;
  modalType: string | null;
  modalId: number | null;
  toggleModal: (
    type?: string,
    id?: number,
    studentActivity?: StudentActivityModal
  ) => void;
  closeModal: () => void;
  studentActivity: StudentActivityModal | null;
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
  const [modalId, setModalId] = useState<number | null>(null);
  const [studentActivity, setStudentActivity] =
    useState<StudentActivityModal | null>(null);

  const toggleModal = (
    type?: string,
    id?: number,
    studentActivity?: StudentActivityModal
  ) => {
    setShowModal(!showModal);
    setModalType(type || null);
    setModalId(id || null);
    setStudentActivity(studentActivity || null);
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
    studentActivity,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};
