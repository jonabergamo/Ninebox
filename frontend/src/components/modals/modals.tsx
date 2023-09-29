"use client";
import React, { useState } from "react";
import { useModal } from "@/context/ModalContext"; // Certifique-se de importar o useModal do arquivo correto
import { IoAlertCircleSharp, IoArrowBackCircleOutline } from "react-icons/io5";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import Cookies from "js-cookie";
import { Alert } from "@material-tailwind/react";

const Modal: React.FC = () => {
  const { showModal, modalType, closeModal } = useModal();
  const { fetchUser, token, user, setSelectedClass } = useUser();
  const [newClassName, SetNewClassName] = useState<string | null>("");
  const [class_id, setClass_id] = useState<string | null>();
  const [error, setError] = useState<string | null>("");

  const handleJoinClass = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/${class_id}/add_user/`,
        {
          user_email: user?.info.email,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );
      if (response.status === 200 || response.status === 201) {
        const class_id = response.data.object.unique_id;
        Cookies.set("selected_class", class_id, {
          secure: true,
          sameSite: "strict",
        });
        if (user?.classes) {
          setSelectedClass(user.classes[class_id]);
        }
        // Atualizar as informações do usuário ou fazer algo mais.
        fetchUser();

        // Fechar o modal após a criação bem-sucedida da classe.
        closeModal();
      } else {
        if (response.status === 404) {
          setError("Essa classe não existe.");
        }
      }
    } catch (error: unknown) {
      setError("Ocorreu um erro. Tente novamente");
      console.error(error);
    }
  };

  const handleNewClass = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/teachers/${user?.info.id}/create_class/`,
        {
          name: newClassName,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const class_id = response.data.object.unique_id;
        Cookies.set("selected_class", class_id, {
          secure: true,
          sameSite: "strict",
        });
        if (user?.classes) {
          setSelectedClass(user.classes[class_id]);
        }
        // Atualizar as informações do usuário ou fazer algo mais.
        fetchUser();

        // Fechar o modal após a criação bem-sucedida da classe.
        closeModal();
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error) {
      console.error("Ocorreu um erro ao criar a classe: ", error);
      // Talvez mostrar algum feedback para o usuário.
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "NewClass":
        return (
          <div>
            <h1>Nova Turma</h1>
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-1 border-gray-500 border-[0.5px]"
              type="text"
              placeholder="Nome da nova turma"
              onChange={(e) => {
                SetNewClassName(e.target.value);
              }}
              autoComplete="new-password"
            />
            {error && (
              <Alert
                icon={<IoAlertCircleSharp />}
                className="mt-5 bg-red-500 flex items-center py-2">
                {error}
              </Alert>
            )}
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleNewClass}>
              Criar
            </button>
          </div>
        );
      case "JoinClass":
        return (
          <div>
            <h1>Entrar em uma Turma</h1>
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-1 border-gray-500 border-[0.5px]"
              type="text"
              placeholder="ID da turma"
              onChange={(e) => {
                setClass_id(e.target.value);
              }}
              autoComplete="new-password"
            />
            {error && (
              <Alert
                icon={<IoAlertCircleSharp />}
                className="mt-5 bg-red-500 flex items-center py-2">
                {error}
              </Alert>
            )}
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleJoinClass}>
              Entrar
            </button>
          </div>
        );
      case "EditClass":
        return <div>Conteúdo para editar uma classe</div>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed z-10 inset-0 overflow-y-auto  ${
        showModal ? "block" : "hidden"
      }`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex gap-5 bg-white rounded-lg p-4 w-92">
          <div className="flex items-start justify-center text-4xl text-blue-500  ">
            <div
              className="hover:scale-110 transition-all cursor-pointer"
              onClick={closeModal}>
              <IoArrowBackCircleOutline />
            </div>
          </div>
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default Modal;
