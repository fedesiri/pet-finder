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

export const getProvinces = async (search = "") => {
  const response = await api.get("/provinces", {
    params: { search },
  });
  return response.data.data;
};

export const getLocalities = async (provinceId, search = "") => {
  const response = await api.get(`/provinces/${provinceId}/localities`, {
    params: { search },
  });
  return response.data.data;
};
