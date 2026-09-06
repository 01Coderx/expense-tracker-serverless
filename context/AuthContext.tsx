"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication after refresh
  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem("kharcha_token");

      const storedUser =
        localStorage.getItem("kharcha_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Failed to restore authentication:",
        error
      );

      localStorage.removeItem("kharcha_token");
      localStorage.removeItem("kharcha_user");

      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const response = await fetch(
      "/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed."
      );
    }

    const loggedInUser: User = data.data.user;
    const loggedInToken: string = data.data.token;

    localStorage.setItem(
      "kharcha_token",
      loggedInToken
    );

    localStorage.setItem(
      "kharcha_user",
      JSON.stringify(loggedInUser)
    );

    setToken(loggedInToken);
    setUser(loggedInUser);
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    const response = await fetch(
      "/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Registration failed."
      );
    }

    const registeredUser: User = data.data.user;
    const registeredToken: string = data.data.token;

    localStorage.setItem(
      "kharcha_token",
      registeredToken
    );

    localStorage.setItem(
      "kharcha_user",
      JSON.stringify(registeredUser)
    );

    setToken(registeredToken);
    setUser(registeredUser);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("kharcha_token");
    localStorage.removeItem("kharcha_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
