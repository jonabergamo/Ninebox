"use client";
import React, { useState } from "react";
import { useModal } from "@/context/ModalContext"; // Certifique-se de importar o useModal do arquivo correto
import { IoAlertCircleSharp, IoArrowBackCircleOutline } from "react-icons/io5";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import Cookies from "js-cookie";
import { Alert } from "@material-tailwind/react";
import toast from "react-hot-toast";
import { Teacher } from "@/types";

const Modal: React.FC = () => {
  const { showModal, modalType, closeModal, modalId } = useModal();
  const { fetchUser, token, user, setSelectedClass, selectedClass } = useUser();
  const [newClassName, SetNewClassName] = useState<string | null>("");
  const [class_id, setClass_id] = useState<string | null>();
  const [error, setError] = useState<string | null>("");
  const [newSubjectName, setNewSubjectName] = useState<string | null>("");
  const [newStudentName, setNewStudentName] = useState<string | null>("");
  const [newStudentEmail, setNewStudentEmail] = useState<string | null>("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [newNineboxName, setNewNineBoxName] = useState<string | null>("");
  const [teacherClass, setTeachersClass] = useState<Teacher[] | null>(null);

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
          response.data.object.name + " adicionado a turma com sucesso"
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
        console.error(e);
      }
    }
  };

  const handleNewNinebox = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/nineboxes/`,
        {
          description: newNineboxName,
          class_obj: selectedClass?.unique_id,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        fetchUser();
        closeModal();
        toast.success("Ninebox " + newSubjectName + " adicionada com sucesso");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido.");
        console.error(error);
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
        if (e.response.status === 400) {
          toast.remove();
          toast.error("O estudante já existe");
        } else {
          toast.error("Ocorreu um erro desconhecido.");
        }
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

  const handleDeleteSubject = async (id: string | number) => {
    toast.loading("Deletando...");
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}`,
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 204) {
        fetchUser();

        // Fechar o modal após a criação bem-sucedida da classe.
        toast.remove();
        closeModal();
        toast.success("Disciplina deletada com sucesso");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido ao deletar a disciplina.");
      }
    }
  };

  const handleDeleteNinebox = async (id: string | number) => {
    toast.loading("Deletando...");
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/nineboxes/${id}`,
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 204) {
        fetchUser();

        // Fechar o modal após a criação bem-sucedida da classe.
        toast.remove();
        closeModal();
        toast.success("Ninebox deletada com sucesso");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido ao deletar a disciplina.");
      }
    }
  };

  const handleAddTeacher = async (id: string | number) => {
    if (!selectedTeachers) return; // Se selectedTeachers é undefined, a função retornará imediatamente.
    for (const email of selectedTeachers) {
      toast.loading(`Adicionando ${email}...`);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}/add_to_teacher/`,
          {
            email: email,
            class_id: selectedClass?.unique_id,
          },
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );

        if (response.status === 200) {
          fetchUser();
          toast.remove();
          toast.success(`Professor ${email} adicionado com sucesso`);
        } else if (response.status === 404) {
          toast.remove();
          toast.error(
            `O professor ${email} especificado não existe, ou não pertence à turma atual`
          );
        } else {
          // Lidar com outros códigos de status aqui.
        }
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const e = error as { response: { status: number } };
          if (e.response.status == 404) {
            toast.remove();
            toast.error(`O professor ${email} especificado não existe`);
          } else if ((e.response.status = 403)) {
            toast.remove();
            toast.error(
              `O professor ${email} especificado não pertence à turma atual`
            );
          } else {
            toast.remove();
            toast.error(
              "Ocorreu um erro desconhecido ao adicionar o professor."
            );
          }
        }
      }
    }
    closeModal();
  };

  const handleRemoveStudent = async (email: any) => {
    toast.loading("Removendo...");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/${selectedClass?.unique_id}/remove_user/`,
        {
          user_email: email,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200) {
        fetchUser();
        // Fechar o modal após a criação bem-sucedida da classe.
        toast.remove();
        closeModal();
        toast.success("Estudante removido com sucesso");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido ao deletar a disciplina.");
      }
    }
  };

  const handleNewPassword = async (id: any) => {
    toast.loading("Gerando nova senha...");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/reset_password/`,
        {},
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200) {
        fetchUser();
        // Fechar o modal após a criação bem-sucedida da classe.
        toast.remove();
        closeModal();
        toast.success("Senha atualizada e enviada com sucesso");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.remove();
        console.error(error);
        toast.error("Ocorreu um erro desconhecido ao gerar uma nova senha.");
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/teachers/?classes=${selectedClass?.unique_id}`,
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );
      setTeachersClass(response.data);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        if (e.response.status === 400) {
          toast.remove();
          toast(`Professores não encontrados na turma ${selectedClass?.name}`, {
            icon: "ℹ️",
          });
        } else {
          toast.error(
            "Ocorreu um erro desconhecido ao carregar os professores."
          );
        }
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
            <div className="flex flex-col gap-2">
              <button
                className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={handleNewClass}>
                Criar
              </button>
              <button
                className=" bg-gray-500 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
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
            <div className="flex flex-col gap-2">
              <button
                className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={handleJoinClass}>
                Entrar
              </button>
              <button
                className=" bg-gray-500 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
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
            <div className="flex flex-col gap-2">
              <button
                className="mt-4 bg-secondary-color-light hover:hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={handleNewSubject}>
                Criar
              </button>
              <button
                className=" bg-gray-500 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      case "NewStudent":
        return (
          <div className="flex flex-col gap-2 px-5 text-primary-color-dark">
            <h1 className="text-primary-color-dark text-md">
              Criar um estudante
            </h1>
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
            <div className="flex flex-col gap-2">
              <button
                className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={handleNewStudent}>
                Criar
              </button>
              <button
                className=" bg-gray-500 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      case "ConfirmDeleteSubject":
        return (
          <div className="flex flex-col gap-5 px-5 text-primary-color-dark items-center justify-center">
            <h1 className="text-2xl">Confirme sua ação</h1>
            <p className="text-red-700 font-bold text-center">
              ALERTA!! Dados importantes podem ser perdidos
            </p>
            <div className="flex flex-col gap-2">
              <button
                className=" bg-gray-300 hover:brightness-90 font-medium py-2 px-4 rounded"
                onClick={() => {
                  if (modalId) {
                    handleDeleteSubject(modalId);
                  }
                }}>
                Confirmar
              </button>
              <button
                className=" bg-red-700 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      case "AddTeacherToSubject":
        fetchTeachers();
        return (
          <div className="flex flex-col gap-2 px-5 text-primary-color-dark">
            <h1 className="text-1xl">Adicionar Professor</h1>
            {/* <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              type="text"
              placeholder="Email do Professor"
              onChange={(e) => {
                setTeacherEmail(e.target.value);
              }}
              autoComplete="new-password"
            /> */}
            <div className="w-80 ">
              <label
                htmlFor="countries_multiple"
                className="inline-flex  text-sm font-medium text-gray-900 ">
                Selecione o professor que deseja adicionar
              </label>
              <select
                multiple
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.options)
                    .filter((option) => option.selected)
                    .map((option) => option.value);

                  setSelectedTeachers(selectedOptions);
                }}
                id="countries_multiple"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500">
                {modalId &&
                  teacherClass &&
                  teacherClass
                    .filter((teacher) => !teacher.subjects.includes(modalId))
                    .map((teacher, index) => (
                      <option key={index} value={teacher.user.email}>
                        {teacher.user.name}
                      </option>
                    ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  if (modalId) {
                    handleAddTeacher(modalId);
                  }
                }}>
                Adicionar
              </button>
              <button
                className=" bg-gray-500 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      case "RemoveStudentFromClass":
        return (
          <div className="flex flex-col gap-5 px-5 text-primary-color-dark items-center justify-center">
            <h1 className="text-2xl">Confirme sua ação</h1>
            <p className="text-red-700 font-bold text-center">
              ALERTA!! Dados importantes podem ser perdidos
            </p>
            <div className="flex flex-col gap-2">
              <button
                className=" bg-gray-300 hover:brightness-90 font-medium py-2 px-4 rounded"
                onClick={() => {
                  if (modalId) {
                    handleRemoveStudent(modalId);
                  }
                }}>
                Confirmar
              </button>
              <button
                className=" bg-red-700 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      case "NewNinebox":
        return (
          <div>
            <h1>Criar uma Ninebox</h1>
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              type="text"
              placeholder="Nome da Ninebox"
              onChange={(e) => {
                setNewNineBoxName(e.target.value);
              }}
              autoComplete="new-password"
            />
            <div className="flex flex-col gap-2">
              <button
                className="mt-4 bg-secondary-color-light hover:hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={handleNewNinebox}>
                Criar
              </button>
              <button
                className=" bg-red-700 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      case "ConfirmDeleteNinebox":
        return (
          <div className="flex flex-col gap-5 px-5 text-primary-color-dark items-center justify-center">
            <h1 className="text-2xl">Confirme sua ação</h1>
            <p className="text-red-700 font-bold text-center">
              ALERTA!! Dados importantes podem ser perdidos
            </p>
            <div className="flex flex-col gap-2">
              <button
                className=" bg-gray-300 hover:brightness-90 font-medium py-2 px-4 rounded"
                onClick={() => {
                  if (modalId) {
                    handleDeleteNinebox(modalId);
                  }
                }}>
                Confirmar
              </button>
              <button
                className=" bg-red-700 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      case "SendNewPassword":
        return (
          <div className="flex flex-col gap-5 px-5 text-primary-color-dark items-center justify-center">
            <h1 className="text-2xl">Confirme sua ação</h1>
            <p className="text-red-700 font-bold text-center">
              A nova senha será enviada para o email do usuário
            </p>
            <div className="flex flex-col gap-2">
              <button
                className=" bg-gray-300 hover:brightness-90 font-medium py-2 px-4 rounded"
                onClick={() => {
                  if (modalId) {
                    handleNewPassword(modalId);
                  }
                }}>
                Confirmar
              </button>
              <button
                className=" bg-red-700 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed z-10 inset-0 overflow-y-auto text-black  ${
        showModal ? "block" : "hidden"
      }`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex gap-5 bg-primary-color  rounded-lg p-4 w-92 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-spacing-1 border-gray-500">
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default Modal;
