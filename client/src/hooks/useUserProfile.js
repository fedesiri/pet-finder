import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserProfile } from "../services/api";

export const useUserProfile = () => {
  const { user } = useContext(AuthContext);
  const token = user?.accessToken;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getUserProfile(token);
      setUserData(response.data);
    } catch (err) {
      setError(err);
      console.error("Error al obtener el perfil:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshProfile = () => {
    fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    userData,
    loading,
    error,
    addresses: userData?.addresses || [],
    refreshProfile,
  };
};
