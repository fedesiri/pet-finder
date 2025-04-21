import { getAuth, onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { appFirebase } from "../credentials";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(appFirebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userFirebase) => {
      setUser(userFirebase);
      setLoading(false);
    });

    return () => unsubscribe(); // limpieza del listener
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
