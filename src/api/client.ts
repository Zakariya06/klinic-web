import { store } from "@/utils";
import axios from "axios";

// In development, use relative URLs to leverage Vite proxy 
export const baseUrl = import.meta.env.PROD
  ? import.meta.env.VITE_TEST_BE_URL ||
    "https://klinic-api-467097446026.europe-west1.run.app"
  : "";
console.log("Base URL:", baseUrl || "Using Vite proxy");
const apiClient = axios.create({
  baseURL: baseUrl,
});

apiClient.interceptors.request.use(async (config) => {
  const authToken = localStorage.getItem("token");
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  // Add ngrok bypass header to skip the warning page
  // This is needed when using ngrok's free tier
  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

export default apiClient;
