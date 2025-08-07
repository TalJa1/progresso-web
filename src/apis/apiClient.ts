import axios from "axios";

// Create an instance of axios with default settings
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // Set a timeout for requests (in milliseconds)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add authorization tokens or other custom headers here
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally, e.g., show a notification or redirect to login
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors
      console.error("Unauthorized access - redirecting to login");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
