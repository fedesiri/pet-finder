import { useState } from "react";
import { updatePet } from "../services/api";

export const useUpdatePet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePetData = async (token, pet_id, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updatePet(token, pet_id, data);

      if (!response.success) {
        throw response;
      }

      return {
        success: true,
        updatedFields: response.data.updated_fields || {},
        message: "Datos de la mascota actualizados correctamente",
      };
    } catch (error) {
      setError(error.error?.message || "Error al actualizar la mascota");

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
    updatePetData,
    isLoading,
    error,
  };
};
