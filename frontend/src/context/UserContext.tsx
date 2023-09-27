"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";

type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_student: boolean;
  is_teacher: boolean;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
};

type UserProviderProps = {
  children: ReactNode;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const fetchUser = () => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");

    if (storedUser && storedToken) {
      const parsed_user = JSON.parse(storedUser);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/?email=${parsed_user.email}`,
          { headers: { Authorization: `Token ${storedToken}` } }
        )
        .then((res) => {
          setUser(parsed_user);
        });
    } else {
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    fetchUser();
    // Recuperar o token do cookie ao montar o componente
    const storedToken = Cookies.get("token");
    const storedUser = Cookies.get("user");

    if (storedToken) {
      setToken(storedToken);
    } else {
      setToken(null);
    }
    if (storedUser) {
      const parsed_user = JSON.parse(storedUser);
      setUser(parsed_user);
    } else {
      setUser(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
};
