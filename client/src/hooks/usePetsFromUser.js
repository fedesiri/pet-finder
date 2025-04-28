import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPetsFromUser } from "../services/api";

export const usePetsFromUser = () => {
  const { user } = useContext(AuthContext);
  const token = user?.accessToken;
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await getPetsFromUser(token);
        setPets(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [token]);

  return { pets, loading, error };
};
