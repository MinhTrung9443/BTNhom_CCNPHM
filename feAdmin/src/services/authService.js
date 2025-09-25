import api from './apiService'

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response
  },

  logout: async () => {
    // Clear local storage
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    return Promise.resolve()
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser')
    return user ? JSON.parse(user) : null
  },

  getToken: () => {
    return localStorage.getItem('adminToken')
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    return !!(token && user)
  },
}

export default authService