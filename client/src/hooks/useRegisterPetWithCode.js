import { useState } from "react";
import { registerPetWithCode } from "../services/api";

export const useRegisterPetWithCode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const registerPet = async (data, token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerPetWithCode(data, token);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registerPet, data, loading, error };
};
