"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Class, FullUser } from "../types";

type UserContextType = {
  user: FullUser | null;
  setUser: React.Dispatch<React.SetStateAction<FullUser | null>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  selectedClass: Class | null;
  setSelectedClass: React.Dispatch<React.SetStateAction<Class | null>>;
  handleSubmit: (email: string, password: string) => Promise<boolean>;
  error: string | null;
  userRole: string | null;
  setError: React.Dispatch<React.SetStateAction<string>>;
  Logout: () => void;
  fetchUser: () => void;
};

type UserProviderProps = {
  children: ReactNode;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [user, setUser] = useState<FullUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!token && !Cookies.get("token")) {
      router.push("/login"); // Redireciona para a página de login se o token não existir
    }
  }, [token]);

  const handleSubmit = (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setError("");

      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/token-auth/`, {
          username: email,
          password: password,
        })
        .then((authResponse) => {
          const data_token = authResponse.data.token;
          if (data_token) {
            setToken(data_token);
            Cookies.set("token", data_token, {
              secure: true,
              sameSite: "strict",
            });
          }

          return axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/users/?email=${email}`,
            {
              headers: { Authorization: `Token ${data_token}` },
            }
          );
        })
        .then((userResponse) => {
          const stored_user: User = userResponse.data[0];
          const user_role = stored_user?.is_teacher
            ? "teachers"
            : stored_user?.is_student
            ? "students"
            : "";
          setUserRole(user_role);

          return axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/${user_role}/${stored_user.id}`,
            {
              headers: { Authorization: `Token ${Cookies.get("token")}` },
            }
          );
        })
        .then((roleResponse) => {
          const { classes, user, nine_boxes, subjects } = roleResponse.data;
          const user_structured = {
            classes: classes,
            info: user,
            nine_boxes,
            subjects,
          };
          const simple_user_structured = {
            info: user,
          };
          setUser(user_structured);
          setSelectedClass(user_structured.classes[0]);
          Cookies.set("user", JSON.stringify(simple_user_structured), {
            secure: true,
            sameSite: "strict",
          });

          toast.success("Login bem sucedido");
          resolve(true);
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
          resolve(false);
        });
    });
  };

  const fetchUser = () => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");
    const stored_class = Cookies.get("selected_class");

    if (storedUser && storedToken) {
      const parsed_user: FullUser = JSON.parse(storedUser);
      const user_role = parsed_user?.info.is_teacher
        ? "teachers"
        : parsed_user?.info.is_student
        ? "students"
        : "";
      setUserRole(user_role);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/${user_role}/${parsed_user.info.id}`,
          {
            headers: { Authorization: `Token ${storedToken}` },
          }
        )
        .then((res) => {
          const { classes, user, nine_boxes, subjects } = res.data;
          const user_structure = {
            classes: classes,
            info: user,
            nine_boxes,
            subjects,
          };
          setUser(user_structure);
          if (
            user_structure.classes.find(
              (obj: Class) => obj.unique_id === stored_class
            )
          ) {
            setSelectedClass(
              user_structure.classes.find(
                (obj: Class) => obj.unique_id === stored_class
              )
            );
          } else {
            setSelectedClass(user_structure.classes[0]);
          }
        })
        .catch((error) => {
          toast("Ocorreu um erro");
        });
    } else {
    }
  };

  useEffect(() => {
    if (selectedClass?.unique_id) {
      Cookies.set("selected_class", selectedClass.unique_id, {
        secure: true,
        sameSite: "strict",
      });
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchUser();
  }, []);

  const Logout = () => {
    setUser(null);
    setToken(null);
    setSelectedClass(null);
    setTempUser(null);

    const cookies = Cookies.get();

    for (let cookieName in cookies) {
      Cookies.remove(cookieName);
    }
    toast.loading("Saindo da conta...");
    router.push("/login");
    toast.remove();
    toast.success("Logout bem sucedido");
  };

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
        userRole,
        Logout,
        fetchUser,
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
