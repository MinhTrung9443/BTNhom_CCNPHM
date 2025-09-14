import axios from "axios";
import { toast } from "react-toastify";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - automatically add accessToken to header if it exists
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("Bad Request:", data.message);
          break;
        case 401:
          console.error('Unauthorized:', data.message);
          // Can redirect to login page
          localStorage.removeItem('accessToken');
          break;
        case 403:
          console.error("Forbidden:", data.message);
          break;
        case 404:
          console.error("Not Found:", data.message);
          break;
        case 500:
          console.error('Server Error:', data.message);
          // toast.error('Server error. Please try again later.');
          break;
        default:
          console.error("Error:", data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
      toast.error('Connection error. Please check your internet connection.');
    } else {
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;