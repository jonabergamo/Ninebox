"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  ReactElement,
  useMemo,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Class, FullUser } from "../types";
import { usePathname } from "next/navigation";

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

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
}): ReactElement => {
  const [user, setUser] = useState<FullUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const verifyToken = useCallback(() => {
    if (!token && !Cookies.get("token")) {
      if (pathname !== "/login") {
        router.push("/login"); // Redireciona para login se o token não existir
      }
    } else {
      if (pathname === "/login") {
        router.push("/"); // Redireciona para a página inicial se o token existir e estiver na página de login
      }
    }
  }, [token, router]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleSubmit = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setError("");
      try {
        const authResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/token-auth/`,
          {
            username: email,
            password,
          }
        );

        const data_token = authResponse.data.token;
        setToken(data_token);
        Cookies.set("token", data_token, { secure: true, sameSite: "strict" });

        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/?email=${email}`,
          {
            headers: { Authorization: `Token ${data_token}` },
          }
        );

        const storedUser: User = userResponse.data[0];
        const userRole = storedUser?.is_teacher ? "teachers" : "students";

        const roleResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/${userRole}/${storedUser.id}`,
          {
            headers: { Authorization: `Token ${data_token}` },
          }
        );
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
        return true;
      } catch (err) {
        setError("Ocorreu um erro. Tente novamente.");
        return false;
      }
    },
    []
  );

  const fetchUser = useCallback(() => {
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
  }, []);

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
  }, [fetchUser]);

  const Logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setSelectedClass(null);

    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });

    toast.loading("Saindo da conta...");
    router.push("/login");
    toast.remove();
    toast.success("Logout bem sucedido");
  }, [router]);

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
