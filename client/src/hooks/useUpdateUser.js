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
      console.log("soy reponse en el hook a ver como estoy llegando! ", response);
      return {
        success: true,
        updatedFields: response.data.updated_fields || {},
        message: "Datos actualizados correctamente",
      };
    } catch (error) {
      let errorMessage = "Error al actualizar los datos";

      if (error.response) {
        errorMessage = error.response.data?.error?.message || error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
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
