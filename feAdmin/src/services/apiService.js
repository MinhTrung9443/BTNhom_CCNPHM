import axios from 'axios'
import { toast } from 'react-toastify'

const API_BASE_URL = 'http://localhost:5000/api'
export const API_URL = API_BASE_URL.replace('/api', '');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      
      // Chỉ redirect nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
    } else if (error.response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.')
    } else if (error.response?.status >= 500) {
      toast.error('Lỗi server. Vui lòng thử lại sau.')
    }
    
    return Promise.reject(error)
  }
)

export default api