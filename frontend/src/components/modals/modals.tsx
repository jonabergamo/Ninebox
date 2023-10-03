"use client";
import React, { useState } from "react";
import { useModal } from "@/context/ModalContext"; // Certifique-se de importar o useModal do arquivo correto
import { IoAlertCircleSharp, IoArrowBackCircleOutline } from "react-icons/io5";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import Cookies from "js-cookie";
import { Alert } from "@material-tailwind/react";
import toast from "react-hot-toast";

const Modal: React.FC = () => {
  const { showModal, modalType, closeModal } = useModal();
  const { fetchUser, token, user, setSelectedClass, selectedClass } = useUser();
  const [newClassName, SetNewClassName] = useState<string | null>("");
  const [class_id, setClass_id] = useState<string | null>();
  const [error, setError] = useState<string | null>("");
  const [newSubjectName, setNewSubjectName] = useState<string | null>("");
  const [newStudentName, setNewStudentName] = useState<string | null>("");
  const [newStudentEmail, setNewStudentEmail] = useState<string | null>("");
  const [newStudentPassword, setNewStudentPassword] = useState<string | null>(
    ""
  );

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
        toast.success(
          "Agora você faz parte da turma " + response.data.object.name
        );
      } else {
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        if (e.response.status === 404) {
          toast.error(
            "Esse ID de turma não está relacionado a nenhuma turma existente."
          );
        } else {
          toast.error("Ocorreu um erro desconhecido.");
        }
      }
    }
  };

  const handleNewSubject = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/`,
        {
          name: newSubjectName,
          class_obj: selectedClass?.unique_id,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        fetchUser();
        closeModal();
        toast.success(
          "Disciplina " + newSubjectName + " adicionada com sucesso"
        );
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido.");
      }
    }
  };

  const addClass = async (email: string, class_id: string) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/${class_id}/add_user/`,
      {
        user_email: email,
      },
      {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      }
    );
    return response.data;
  };

  const handleNewStudent = async () => {
    toast.loading("Criando estudante");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/create_with_random_password/`,
        {
          name: newStudentName,
          email: newStudentEmail,
          is_student: true,
          is_teacher: false,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        fetchUser();
        closeModal();
        toast.remove();
        if (selectedClass?.unique_id) {
          addClass(response.data.email, selectedClass.unique_id);
        }
        toast.success(
          "Estudante " +
            newStudentName +
            " criado e adicionado a turma " +
            selectedClass?.name
        );
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido.");
      }
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
        toast.success("Turma " + newClassName + " criada com sucesso");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido.");
      }
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "NewClass":
        return (
          <div>
            <h1>Nova Turma</h1>
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
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
              className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
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
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
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
              className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
              onClick={handleJoinClass}>
              Entrar
            </button>
          </div>
        );
      case "NewSubject":
        return (
          <div>
            <h1>Criar uma disciplina</h1>
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              type="text"
              placeholder="Nome da disciplina"
              onChange={(e) => {
                setNewSubjectName(e.target.value);
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
              className="mt-4 bg-secondary-color-light hover:hover:brightness-90 text-white font-bold py-2 px-4 rounded"
              onClick={handleNewSubject}>
              Criar
            </button>
          </div>
        );
      case "NewStudent":
        return (
          <div className="flex flex-col gap-5 px-5 text-primary-color-dark">
            <h1 className="text-primary-color-light">Criar um estudante</h1>
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              type="text"
              placeholder="Nome"
              onChange={(e) => {
                setNewStudentName(e.target.value);
              }}
              autoComplete="new-password"
            />
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              type="text"
              placeholder="Email"
              onChange={(e) => {
                setNewStudentEmail(e.target.value);
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
              className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
              onClick={handleNewStudent}>
              CriarS
            </button>
          </div>
        );
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
        <div className="flex gap-5 bg-primary-color dark:bg-primary-color-dark rounded-lg p-4 w-92">
          <div className="flex items-start justify-center text-4xl text-secondary-color-light  ">
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
