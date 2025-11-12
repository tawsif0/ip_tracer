// hooks/useAuth.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Create the context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  // Use React.createElement instead of JSX
  return React.createElement(AuthContext.Provider, { value: value }, children);
};

// useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
