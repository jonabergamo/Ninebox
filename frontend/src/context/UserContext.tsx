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
import { useRouter } from "next/navigation";
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
  handleSubmit: (email: string, password: string) => void;
  error: string | null;
  userRole: string | null;
  setError: React.Dispatch<React.SetStateAction<string>>;
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [error, setError] = useState("");
  const router = useRouter()

const handleSubmit = (email: string, password: string) => {
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token-auth/`, {
      username: email,
      password: password,
    })
    .then(authResponse => {
      const data_token = authResponse.data.token;
      setToken(data_token);
      Cookies.set("token", data_token, { secure: true, sameSite: "strict" });

      return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/?email=${email}`, {
        headers: { Authorization: `Token ${data_token}` }
      });
    })
    .then(userResponse => {
      const stored_user: User = userResponse.data[0];
      const user_role = stored_user?.is_teacher ? "teachers" : stored_user?.is_student ? "students" : "";
      setUserRole(user_role)
      return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${user_role}/${stored_user.id}`, {
        headers: { Authorization: `Token ${Cookies.get("token")}` }
      });
    })
    .then(roleResponse => {
      const { classes, user } = roleResponse.data;
      const user_structured = { classes: classes, info: user };
      setUser(user_structured);
      Cookies.set("user", JSON.stringify(user_structured), { secure: true, sameSite: "strict" });
      setError('')
    })
    .catch((err: unknown) => {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          setError("Email ou senha inválidos.");
        } else {
          setError("Ocorreu um erro. Tente novamente.");
        }
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    });
};

  const fetchUser = () => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");

    if (storedUser && storedToken) {
      const parsed_user: FullUser = JSON.parse(storedUser);
      const user_role = parsed_user?.info.is_teacher
        ? "teachers"
        : parsed_user?.info.is_student
          ? "students"
          : "";
      setUserRole(user_role)
      console.log(parsed_user)
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${user_role}/${parsed_user.info.id}`, {
        headers: { Authorization: `Token ${storedToken}` }
      })
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
        error,
        setError,
        userRole
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
