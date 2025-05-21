import { debounce } from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getLostPets } from "../services/api";
import { useUserProfile } from "./useUserProfile";

export const useLostPets = ({ initialPage = 1, initialItemsPerPage = 10, initialFilters = {} } = {}) => {
  const [data, setData] = useState([]);
  const { user } = useContext(AuthContext);
  const { userData } = useUserProfile();
  const token = user?.accessToken;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    items_per_page: initialItemsPerPage,
    total_items: 0,
  });

  const [filters, setFilters] = useState({
    is_active: true,
    page: initialPage,
    items_per_page: initialItemsPerPage,
    // Filtros reales (inicializados como null/undefined):
    province_id: null,
    locality_id: null,
    name: undefined,
    breed: undefined,
    ...initialFilters,
  });

  // Actualizar filtros cuando los datos del usuario están disponibles
  useEffect(() => {
    if (userData?.addresses?.[0]) {
      const { province_id, locality_id } = userData.addresses[0];
      setFilters((prev) => ({
        ...prev,
        province_id,
        locality_id,
      }));
    }
  }, [userData]);

  const fetchLostPets = useCallback(async (token, currentFilters) => {
    if (!token) return;

    try {
      setLoading(true);

      // Limpiar filtros antes de enviar
      const cleanFilters = {
        page: currentFilters.page,
        items_per_page: currentFilters.items_per_page,
        is_active: currentFilters.is_active,
        ...(currentFilters.province_id && { province_id: currentFilters.province_id }),
        ...(currentFilters.locality_id && { locality_id: currentFilters.locality_id }),
        ...(currentFilters.name && { name: currentFilters.name }),
        ...(currentFilters.species && { species: currentFilters.species }),
        ...(currentFilters.breed && { breed: currentFilters.breed }),
        ...(currentFilters.dateRange && {
          start_date: currentFilters.dateRange[0]?.toISOString(),
          end_date: currentFilters.dateRange[1]?.toISOString(),
        }),
      };

      const response = await getLostPets(token, cleanFilters);

      setData(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total_items: response.pagination?.total_items || 0,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error fetching lost pets"));
      console.error("Error fetching lost pets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce(async (token, currentFilters) => {
      await fetchLostPets(token, currentFilters);
    }, 500),
    [fetchLostPets]
  );

  useEffect(() => {
    if (token) {
      debouncedFetch(token, {
        ...filters,
        page: pagination.page,
        items_per_page: pagination.items_per_page,
      });
    }
    return () => debouncedFetch.cancel();
  }, [filters, pagination.page, pagination.items_per_page, token, debouncedFetch]);

  const changePage = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      page,
      items_per_page: pageSize,
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [filterName]: value === "" ? undefined : value,
      };

      // Resetear localidad si cambia la provincia
      if (filterName === "province_id") {
        newFilters.locality_id = undefined;
      }

      // Resetear a página 1 cuando cambian los filtros
      setPagination((prev) => ({ ...prev, page: 1 }));

      return newFilters;
    });
  };

  const resetFilters = () => {
    const userLocation = userData?.addresses?.[0];
    setFilters({
      is_active: true,
      page: initialPage,
      items_per_page: initialItemsPerPage,
      province_id: userLocation?.province_id || null,
      locality_id: userLocation?.locality_id || null,
      name: undefined,
      species: undefined,
      breed: undefined,
      dateRange: undefined,
      ...initialFilters,
    });
    setPagination({
      page: initialPage,
      items_per_page: initialItemsPerPage,
      total_items: 0,
    });
  };

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    fetchLostPets: () => fetchLostPets(token, filters),
    changePage,
    handleFilterChange,
    resetFilters,
    setLoading,
  };
};
