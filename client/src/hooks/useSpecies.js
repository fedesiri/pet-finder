import { Alert, Spin } from "antd";
import { useEffect, useState } from "react";
import { getSpecies } from "../services/api";

export const useSpecies = () => {
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSpecies = async () => {
    try {
      const response = await getSpecies();
      const options = response.values.map((value) => ({
        value,
        label: response.labels[value],
      }));
      setSpeciesOptions(options);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error cargando especies"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  const SpeciesLoader = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <Spin tip="Cargando especies..." />
        </div>
      );
    }

    if (error) {
      return <Alert message={error.message} type="error" />;
    }

    return null;
  };

  return {
    speciesOptions,
    loading,
    error,
    SpeciesLoader,
    refresh: loadSpecies,
  };
};
