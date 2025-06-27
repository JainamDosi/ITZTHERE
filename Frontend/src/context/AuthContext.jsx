import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Fetch user info from backend on mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/auth/me", { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const login = (userData) => {
    setUser(userData);
    // No localStorage
  };

  const logout = async () => {
    setUser(null);
    // Call backend to clear cookie
    await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}