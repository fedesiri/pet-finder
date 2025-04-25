import { Spin } from "antd";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { appFirebase } from "../credentials";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(appFirebase);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userFirebase) => {
      setUser(userFirebase);
      setLoading(false);
    });

    return () => unsubscribe(); // limpieza del listener
  }, [auth]);

  if (loading) {
    return <Spin></Spin>;
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}
