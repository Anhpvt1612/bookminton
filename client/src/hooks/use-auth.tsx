import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUserState(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setIsLoading(false);
  }, []);

  // Set user and token in state and localStorage
  const setUser = (user: User, token: string) => {
    setUserState(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // Clear user and token from state and localStorage
  const logout = () => {
    setUserState(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    setUser,
    logout
  };

  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
