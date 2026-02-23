import axios from "axios";

const baseURL =
  import.meta.env.VITE_TEST_BE_URL ||
  "http://localhost:8000";

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Use `set` instead of replacing headers to satisfy Axios types
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    (config.headers as any).Accept = "application/json";
    (config.headers as any)["Content-Type"] = "application/json";
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized - Token expired");
      alert("User unAuthorized Login again");
      // Remove expired token
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
