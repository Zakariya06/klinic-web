import axios from "axios";

const baseURL =
  import.meta.env.VITE_TEST_BE_URL ||
  "https://klinic-api-467097446026.europe-west1.run.app";

const apiClient = axios.create({
  baseURL, 
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("this is local token", token);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
    console.log("Token send successfully ........");
  } else {
    console.log("Token Failed ........");
  }

  return config;
});

export default apiClient;
