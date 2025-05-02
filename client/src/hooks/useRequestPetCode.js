import { useState } from "react";
import { requestPetCode } from "../services/api";

export const useRequestPetCode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const requestCode = async (data, token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestPetCode(data, token);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { requestCode, data, loading, error, reset: () => setData(null) };
};
