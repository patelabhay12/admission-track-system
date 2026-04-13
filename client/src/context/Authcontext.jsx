import { createContext, useContext, useState, useCallback } from "react";
import { login as loginAPI, register as registerAPI } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN (API)
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError("");

    try {
      const res = await loginAPI({ email, password });

      if (res.success) {
        // Save token
        localStorage.setItem("token", res.token);

        // Save user
        setCurrentUser(res.user);

        return { success: true };
      } else {
        setError(res.message || "Login failed");
        return { success: false };
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // 📝 REGISTER (API)
  const register = useCallback(async (data) => {
    setLoading(true);
    setError("");

    try {
      const res = await registerAPI(data);

      if (res.success) {
        localStorage.setItem("token", res.token);
        setCurrentUser(res.user);

        return { success: true };
      } else {
        setError(res.message || "Registration failed");
        return { success: false };
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚪 LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  }, []);

  // 👑 Roles
  const isAdmin = currentUser?.role === "admin";
  const isManager = currentUser?.role === "manager";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        error,
        loading,
        isAdmin,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}