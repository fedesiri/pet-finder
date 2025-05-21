import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserProfile } from "../services/api";

export const useUserProfile = () => {
  const { user } = useContext(AuthContext);
  const token = user?.accessToken;

  const [state, setState] = useState({
    userData: null,
    loading: true,
    error: null,
    addresses: [],
  });

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await getUserProfile(token);
      setState({
        userData: response.data,
        addresses: response.data?.addresses || [],
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
    }
  }, [token]);

  const refreshProfile = useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const updateLocalUserData = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      userData: prev.userData ? { ...prev.userData, ...updates } : null,
      // Actualiza addresses si es necesario
      addresses: updates.addresses ? updates.addresses : prev.addresses,
    }));
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    userData: state.userData,
    loading: state.loading,
    error: state.error,
    addresses: state.addresses,
    refreshProfile,
    setUserData: updateLocalUserData,
  };
};
