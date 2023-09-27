import React from "react";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Alert } from "@material-tailwind/react";
import { IoAlertCircleSharp } from "react-icons/io5";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { setToken, token, setUser, user } = useUser();

  const handleSubmit = () => {
    setError("");
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/token-auth/`, {
        username: email,
        password: password,
      })
      .then((response) => {
        const data_token = response.data.token;
        setToken(data_token);
        Cookies.set("token", data_token, {
          secure: true,
          sameSite: "strict",
        });

        return axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/?email=${email}`,
          {
            headers: { Authorization: `Token ${data_token}` },
          }
        );
      })
      .then((response) => {
        const user_data = response.data[0];
        Cookies.set("user", JSON.stringify(user_data), {
          secure: true,
          sameSite: "strict",
        });
        setUser(user_data);
        console.log(user_data);
      })
      .catch((err) => {
        // Verifica se é um erro 400
        if (err.response && err.response.status === 400) {
          setError("Email ou senha inválidos.");
        } else {
          // Para outros erros, você pode querer ser mais genérico
          setError("Ocorreu um erro. Tente novamente.");
        }
      });
  };

  return (
    <div className="md:w-1/3 max-w-sm">
      <div className="text-center md:text-left"></div>
      <input
        className="w-full px-4 py-2 rounded outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-1 border-gray-500 border-[0.5px]"
        type="text"
        placeholder="Email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <div className="relative w-full container mx-auto mt-5">
        <input
          className="w-full px-4 py-2 rounded outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-1 border-gray-500 border-[0.5px]"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 cursor-pointer"
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
          className="text-blue-600 hover:text-blue-700 hover:underline hover:underline-offset-4"
          href="#">
          Esqueceu a senha?
        </a>
      </div>
      <div className="text-center md:text-left">
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white uppercase rounded text-xs tracking-wider"
          type="submit"
          onClick={handleSubmit}>
          Entrar
        </button>
      </div>
    </div>
  );
}
