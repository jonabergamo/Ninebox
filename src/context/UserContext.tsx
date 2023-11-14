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
  const pathname = usePathname();

  const fetchUser = useCallback(() => {
    const storedUser = Cookies.get("user");
    const storedToken = Cookies.get("token");
    const stored_class = Cookies.get("selected_class");

    if (storedUser) {
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
    fetchUser();
  }, [fetchUser]);

  const Logout = useCallback(() => {}, [router]);

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
