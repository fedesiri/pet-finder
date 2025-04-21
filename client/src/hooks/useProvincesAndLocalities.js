import { useCallback, useEffect, useState } from "react";
import { getLocalities, getProvinces } from "../services/api";

export const useProvincesAndLocalities = () => {
  // Estado inicial
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [loading, setLoading] = useState({
    provinces: false,
    localities: false,
    moreProvinces: false,
    moreLocalities: false,
  });
  const [search, setSearch] = useState({
    province: "",
    locality: "",
  });
  const [pagination, setPagination] = useState({
    provinces: { page: 1, pageSize: 10, total: 0 },
    localities: { page: 1, pageSize: 10, total: 0 },
  });

  // Función para cargar provincias (memoizada con useCallback)
  const loadProvinces = useCallback(
    async (newPage = 1, isNewSearch = false) => {
      const loadingKey = isNewSearch ? "provinces" : "moreProvinces";

      setLoading((prev) => ({ ...prev, [loadingKey]: true, ...(isNewSearch && { moreProvinces: false }) }));

      try {
        const { data, pagination: apiPagination } = await getProvinces({
          page: newPage,
          items_per_page: pagination.provinces.pageSize,
          search: search.province,
        });

        setProvinces((prev) => (isNewSearch ? data : [...prev, ...data]));
        setPagination((prev) => ({
          ...prev,
          provinces: {
            ...prev.provinces,
            page: newPage,
            total: apiPagination.total_items,
          },
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [loadingKey]: false }));
      }
    },
    [pagination.provinces.pageSize, search.province]
  );

  // Función para cargar localidades (memoizada con useCallback)
  const loadLocalities = useCallback(
    async (newPage = 1, isNewSearch = false) => {
      if (!selectedProvince) return;

      const loadingKey = isNewSearch ? "localities" : "moreLocalities";

      setLoading((prev) => ({ ...prev, [loadingKey]: true }));

      try {
        const { data, pagination: apiPagination } = await getLocalities(selectedProvince, {
          page: newPage,
          items_per_page: pagination.localities.pageSize,
          search: search.locality,
        });

        setLocalities((prev) => (isNewSearch ? data : [...prev, ...data]));
        setPagination((prev) => ({
          ...prev,
          localities: {
            ...prev.localities,
            page: newPage,
            total: apiPagination.total_items,
          },
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [loadingKey]: false }));
      }
    },
    [selectedProvince, pagination.localities.pageSize, search.locality]
  );

  // Efecto para búsqueda de provincias
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProvinces(1, true);
    }, 500);

    return () => clearTimeout(timer);
  }, [loadProvinces]);

  // Efecto para búsqueda de localidades
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLocalities(1, true);
    }, 500);

    return () => clearTimeout(timer);
  }, [loadLocalities]);

  // Acciones para los componentes
  const handleProvinceSearch = (value) => {
    setSearch((prev) => ({ ...prev, province: value }));
  };

  const handleLocalitySearch = (value) => {
    setSearch((prev) => ({ ...prev, locality: value }));
  };

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setLocalities([]);
    setSearch((prev) => ({ ...prev, locality: "" }));
  };

  const loadMoreProvinces = () => {
    if (!loading.moreProvinces) {
      loadProvinces(pagination.provinces.page + 1);
    }
  };

  const loadMoreLocalities = () => {
    if (!loading.moreLocalities) {
      loadLocalities(pagination.localities.page + 1);
    }
  };

  return {
    provinces,
    localities,
    loading,
    selectedProvince,
    pagination,
    handleProvinceSearch,
    handleLocalitySearch,
    handleProvinceChange,
    loadMoreProvinces,
    loadMoreLocalities,
  };
};
