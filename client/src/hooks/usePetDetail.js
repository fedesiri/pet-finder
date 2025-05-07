import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getPetDetail } from "../services/api";

export const usePetDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const token = user?.accessToken;
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const response = await getPetDetail(token, id);

        if (!response.success) {
          throw new Error(response.error?.message || "Error al cargar la mascota");
        }

        if (!response.data) {
          throw new Error("Mascota no encontrada");
        }

        setPet(response.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching pet detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [token, id]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await getPetDetail(token, id);
      setPet(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { pet, loading, error, refreshData };
};
