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
  user: FullUser | null;
  setUser: React.Dispatch<React.SetStateAction<FullUser | null>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  selectedClass: Class | null;
  setSelectedClass: React.Dispatch<React.SetStateAction<Class | null>>;
  handleSubmit: () => void;
};

type UserProviderProps = {
  children: ReactNode;
};

type Class = {
  unique_id: string;
  name: string;
  students: any[]; // Substitua "any" pelo tipo exato se você tiver a estrutura dos estudantes
  teachers: number[];
  activities: any[]; // Substitua "any" pelo tipo exato se você tiver a estrutura das atividades
  nineboxes: any[]; // Substitua "any" pelo tipo exato se você tiver a estrutura dos nineboxes
};

type FullUser = {
  classes: Class[];
  info: User;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [user, setUser] = useState<FullUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleSubmit = (email: string, password: string) => {
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
          return "Email ou senha inválidos.";
        } else {
          // Para outros erros, você pode querer ser mais genérico
          return "Ocorreu um erro. Tente novamente.";
        }
      });
  };

  const fetchUser = () => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");

    if (storedUser && storedToken) {
      const parsed_user: User = JSON.parse(storedUser);
      const user_role = parsed_user?.is_teacher
        ? "teachers"
        : parsed_user?.is_student
        ? "students"
        : "";
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/${user_role}/${parsed_user.id}`,
          {
            headers: { Authorization: `Token ${storedToken}` },
          }
        )
        .then((res) => {
          const { classes, user } = res.data;
          const user_structure = { classes: classes, info: user };
          setUser(user_structure);
          console.log(user_structure);
        });
    } else {
      setUser(null);
      setTempUser(null);
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
      setTempUser(parsed_user);
    } else {
      setTempUser(null);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        selectedClass,
        setSelectedClass,
        handleSubmit,
      }}>
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
