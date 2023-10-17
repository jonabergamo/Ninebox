"use client";
import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoAlert, IoClose } from "react-icons/io5";
import { PiPasswordFill } from "react-icons/pi";
import Cookies from "js-cookie";

export default function SettingsModal() {
  const { closeModal } = useModal();
  const { user, fetchUser } = useUser();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      toast.error("As senhas não coencidem.");
      return;
    }
    toast.loading("Alterando...");
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.info.id}/`,
        {
          password: password,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        fetchUser();
        closeModal();
        toast.remove();
        toast.success("Senha alterada com sucesso!");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        if (e.response.status === 400) {
        } else {
          toast.remove();
          toast.error("Ocorreu um erro desconhecido.");
          console.error(error);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 px-24 pb-5 text-primary-color-dark relative">
      <button
        className="absolute top-0 left-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
        onClick={() => {
          closeModal();
        }}>
        <IoClose />
      </button>
      <h1 className="text-primary-color-dark text-2xl w-full text-center">
        Meu Perfil
      </h1>
      <label className="flex flex-col">
        Nome de usuário:
        <input
          disabled
          className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
          value={user?.info.name}
        />
      </label>
      <label className="flex flex-col ">
        Email:
        <input
          disabled
          className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
          value={user?.info.email}
        />
      </label>

      {!editMode ? (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col ">
            Senha:
            <input
              type="password"
              disabled
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              value={"tubas@123"}
            />
          </label>
          <div
            className="flex rounded-md cursor-pointer bg-secondary-color-dark p-2 hover:scale-105 transition-all duration-300 text-white items-center text-2xl justify-start gap-5"
            onClick={() => {
              setEditMode(true);
            }}>
            <PiPasswordFill /> <p className="text-sm">Mudar Senha</p>
          </div>
        </div>
      ) : (
        <div>
          <label className="flex flex-col ">
            Nova Senha:
            <input
              type="password"
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
          </label>
          <label className="flex flex-col ">
            Confirme a sua nova senha:
            <input
              type="password"
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </label>
          <div className="text-red-500 flex gap-2 p-2 items-center justify-start text-sm">
            <IoAlert />
            {user?.info.is_student ? (
              <p>
                Somente um professor consegue recuperar sua senha em caso de
                perda
              </p>
            ) : (
              <p>
                Somente um usuário administrador consegue recuperar sua senha em
                caso de perda
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
              onClick={handleChangePassword}>
              Salvar
            </button>
            <button
              className=" bg-gray-500 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setEditMode(false);
              }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
