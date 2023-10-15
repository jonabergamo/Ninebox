"use client";
import React from "react";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Alert } from "@material-tailwind/react";
import { IoAlertCircleSharp } from "react-icons/io5";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/app/loadingScreen";
import { Ping } from "@uiball/loaders";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setToken, token, setUser, user, handleSubmit, error } = useUser();
  const router = useRouter();

  const Login = async () => {
    setLoading(true);

    try {
      const result = await handleSubmit(email, password); // agora ele aguardará a Promise resolver
      if (result) {
        // Seu código para login bem sucedido
      } else {
        // Seu código para login mal sucedido
        setLoading(false);
      }
    } catch (error) {
      // Tratamento de erro
      setLoading(false);
    }
  };

  return (
    <div className="md:w-1/3 max-w-sm text-black">
      <div className="text-2xl text-black dark:text-white text-center md:text-left mb-5">
        Entrar
      </div>
      <input
        className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
        type="text"
        placeholder="Email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <div className="relative w-full container mx-auto mt-5">
        <input
          className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 dark:text-black cursor-pointer"
          onClick={() => {
            setShowPassword(!showPassword);
          }}>
          {!showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
        </div>
      </div>
      {error && (
        <Alert
          icon={<IoAlertCircleSharp />}
          className="mt-5 bg-red-500 flex items-center py-2">
          {error}
        </Alert>
      )}
      <div className="mt-4 flex justify-between font-semibold text-sm">
        <a
          className="text-secondary-color-light hover:text-secondary-color-light hover:underline hover:underline-offset-4"
          href="#">
          Esqueceu a senha?
        </a>
      </div>
      {!loading ? (
        <div className="text-center md:text-left">
          
          <button
            className="mt-4 bg-secondary-color-light hover:brightness-90 px-4 py-2 text-white uppercase rounded text-xs tracking-wider"
            type="submit"
            onClick={Login}>
            Entrar
          </button>
          
        </div>
      ) : (
        <div className="m-5 w-20">
          <Ping color="red" />
        </div>
      )}
    </div>
  );
}
