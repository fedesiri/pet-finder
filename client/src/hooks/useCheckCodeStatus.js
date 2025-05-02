import { useState } from "react";
import { checkCodeStatus } from "../services/api";

export const useCheckCodeStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const checkStatus = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await checkCodeStatus(code);
      setStatus(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { checkStatus, status, loading, error };
};
