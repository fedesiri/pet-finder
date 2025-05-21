import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});

export const getPets = async () => {
  const response = await api.get("/pets");
  return response.data;
};

export const getPetByQrCode = async (qr_code) => {
  const response = await api.get(`/pets/qr/${qr_code}`);
  return response.data;
};

export const getSpecies = async () => {
  const response = await api.get("/pets/species");
  return response.data.data;
};

export const getProvinces = async ({ page = 1, items_per_page = 10, search }) => {
  const response = await api.get("/provinces", {
    params: { search, page, items_per_page },
  });
  return response.data;
};

export const getLocalities = async (provinceId, { page = 1, items_per_page = 10, search }) => {
  const response = await api.get(`/provinces/${provinceId}/localities`, {
    params: { search, page, items_per_page },
  });
  return response.data;
};

export const getLocalityById = async (province_id, locality_id) => {
  try {
    const response = await api.get(`/provinces/${province_id}/locality/${locality_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lost pets:", error);
    throw error;
  }
};

export const registerUser = async (data) => {
  try {
    const response = await api.post("/pets/register-user", data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error en el registro");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

export const getUserProfile = async (token) => {
  try {
    const response = await api.get(`/pets/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getPetsFromUser = async (token) => {
  try {
    const response = await api.get(`/pets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const requestPetCode = async (data, token) => {
  try {
    const response = await api.post(`/pets/request-code`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error request pet code:", error);
    throw new Error(error.response?.data?.error?.message || "Error al solicitar el código");
  }
};

export const checkCodeStatus = async (code) => {
  try {
    const response = await api.get(`/pets/code/${code}/status`);
    return response.data;
  } catch (error) {
    console.error("Error check code status:", error);
    throw new Error(error.response?.data?.error?.message || "Error al verificar el código");
  }
};

export const registerPetWithCode = async (data, token) => {
  try {
    const response = await api.post(`/pets/register-with-code`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error register pet with code:", error);
    throw new Error(
      error.response?.data?.error?.message || error.response?.data?.message || "Error al registrar la mascota"
    );
  }
};

export const getPetDetail = async (token, pet_id) => {
  try {
    const response = await api.get(`/pets/${pet_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error get pet detail:", error);
    throw new Error(
      error.response?.data?.error?.message || error.response?.data?.message || "Error al obtener detalle de la mascota"
    );
  }
};

export const getPublicPetDetail = async (pet_id) => {
  try {
    const response = await api.get(`/pets/public/${pet_id}`);
    return response.data;
  } catch (error) {
    console.error("Error get pet/public detail:", error);
    throw new Error(
      error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Error al obtener detalle publico de la mascota"
    );
  }
};

export const getLostPets = async (token, { page = 1, items_per_page = 10, ...filters } = {}) => {
  try {
    const response = await api.get("/lost-pets", {
      params: { page, items_per_page, ...filters },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching lost pets:", error);
    throw error;
  }
};

export const updateUser = async (token, data) => {
  try {
    const response = await api.patch("/pets/update-user", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // Devuelve la respuesta directa del backend
  } catch (error) {
    // Si hay respuesta de error del backend, la devuelve tal cual
    if (error.response) {
      throw error.response.data; // Esto lanza EXACTAMENTE lo que el backend respondió
    }
    // Para errores de red u otros, crea una estructura similar
    throw {
      success: false,
      error: {
        message: "Error de conexión",
        description: error.message,
      },
    };
  }
};
