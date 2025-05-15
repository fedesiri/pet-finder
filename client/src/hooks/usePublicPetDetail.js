import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicPetDetail } from "../services/api";

export const usePublicPetDetail = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const response = await getPublicPetDetail(id);

        if (!response.success) {
          throw new Error(response.error?.message || "Error al cargar la mascota");
        }

        if (!response.data) {
          throw new Error("Mascota no encontrada");
        }

        setPet(response.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching public pet detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPet();
  }, [id]); // Dependencia solo del id

  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await getPublicPetDetail(id);
      setPet(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { pet, loading, error, refreshData };
};
