import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi HTTP
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data.message);
          break;
        case 401:
          console.error('Unauthorized:', data.message);
          // Có thể redirect đến trang login
          localStorage.removeItem('accessToken');
          break;
        case 403:
          console.error('Forbidden:', data.message);
          break;
        case 404:
          console.error('Not Found:', data.message);
          break;
        case 500:
          console.error('Server Error:', data.message);
          toast.error('Lỗi server. Vui lòng thử lại sau.');
          break;
        default:
          console.error('Error:', data.message);
      }
    } else if (error.request) {
      // Lỗi network
      console.error('Network Error:', error.message);
      toast.error('Lỗi kết nối. Vui lòng kiểm tra internet.');
    } else {
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
