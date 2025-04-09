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
  console.log("responbse en apiii front ", response.data);
  return response.data;
};
