"use client";
import React, { useRef, useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { BiRefresh, BiSolidUser } from "react-icons/bi";
import toast from "react-hot-toast";
import { MdRefresh } from "react-icons/md";
import { useModal } from "@/context/ModalContext";

export default function UserInfo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toggleModal } = useModal();
  const { user, Logout, fetchUser } = useUser();
  const [expand, setExpand] = useState<boolean>(false);
  const user_info = user?.info;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setExpand(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  return (
    user?.info && (
      <div
        className="flex items-center justify-end px-5 space-x-10"
        ref={containerRef}>
        <div className="flex flex-shrink-0 items-center space-x-4 ">
          <div className="flex flex-col items-end ">
            <div className="text-md font-medium ">{user_info?.name}</div>
            <div className="text-sm font-regular">
              {user_info?.is_teacher
                ? "Professor"
                : user_info?.is_student
                ? "Estudante"
                : ""}
            </div>
          </div>

          <div
            className="flex text-2xl text-gray-400 h-10 w-10 rounded-full items-center justify-center cursor-pointer bg-primary-color-light dark:bg-primary-color-dark border-2 border-secondary-color-light"
            onClick={() => {
              setExpand(!expand);
            }}>
            <BiSolidUser />
            {expand && (
              <div className="absolute w-auto min-w-[100px] top-16 text-sm p-2  bg-white rounded-md text-black flex flex-col gap-2">
                <p
                  className="hover:bg-red-500 hover:text-white p-2 rounded-sm"
                  onClick={() => {
                    toggleModal("Settings");
                  }}>
                  Meu perfil
                </p>
                <p
                  className="hover:bg-red-500 hover:text-white p-2 rounded-sm"
                  onClick={Logout}>
                  Sair
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              fetchUser();
              toast.success("Recarregamento de página concluido");
            }}
            className="text-3xl text-secondary-color-light hover:animate-spin">
            <MdRefresh />
          </button>
        </div>
      </div>
    )
  );
}
