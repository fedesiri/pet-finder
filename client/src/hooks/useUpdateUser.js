import { useState } from "react";
import { updateUser } from "../services/api";

export const useUpdateUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserData = async (token, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateUser(token, data);

      if (!response.success) {
        throw response;
      }

      return {
        success: true,
        updatedFields: response.data.updated_fields || {},
        message: "Datos actualizados correctamente",
      };
    } catch (error) {
      setError(error.error?.message || "Error al actualizar");

      return {
        success: false,
        error: error.error || error,
        rawError: error,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserData,
    isLoading,
    error,
  };
};
