import axios from "axios";
export const baseUrl = import.meta.env.PROD
  ? import.meta.env.VITE_TEST_BE_URL ||
    "https://klinic-api-467097446026.europe-west1.run.app"
  : "";

const apiClient = axios.create({ baseURL: import.meta.env.VITE_TEST_BE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
