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
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

type UserContextType = {
  user: FullUser | null;
  setUser: React.Dispatch<React.SetStateAction<FullUser | null>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  selectedClass: Class | null;
  setSelectedClass: React.Dispatch<React.SetStateAction<Class | null>>;
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
  const { data: session } = useSession();
  const [user, setUser] = useState<FullUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchUser = useCallback(() => {
    const storedUser = session?.user;
    const stored_class = Cookies.get("selected_class");
    const axiosAuth = useAxiosAuth();

    if (session?.user && session.user.access) {
      const user_role = storedUser?.is_teacher
        ? "teachers"
        : storedUser?.is_student
        ? "students"
        : "";
      setUserRole(user_role);
      axiosAuth
        .get(`/${user_role}/${session.user.id}`)
        .then((res) => {
          const { classes, user, nine_boxes, subjects } = res.data;
          const user_structure = {
            classes: classes,
            info: user,
            nine_boxes,
            subjects,
          };
          setUser(user_structure);
          console.log("user", user_structure);
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
