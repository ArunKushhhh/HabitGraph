import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// interceptor to attach token to the requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// interceptor to handle the response and 401 error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      const { data } = await axios.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );

      localStorage.setItem("accessToken", data.accessToken);

      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
