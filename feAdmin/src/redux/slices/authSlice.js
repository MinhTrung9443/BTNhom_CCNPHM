import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

// Async thunks
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password)

      const { user, token } = response.data.data
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return rejectWithValue('Bạn không có quyền truy cập trang quản trị')
      }
      
      // Store token in localStorage
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(user))
      
      return { user, token }
    } catch (error) {
      // Xử lý các loại error khác nhau
      if (error.response?.status === 401) {
        return rejectWithValue('Email hoặc mật khẩu không đúng')
      }
      if (error.response?.status === 404) {
        return rejectWithValue('Tài khoản không tồn tại')
      }
      if (error.response?.status >= 500) {
        return rejectWithValue('Lỗi server, vui lòng thử lại sau')
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Đăng nhập thất bại')
    }
  }
)

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('adminUser')) || null,
  token: localStorage.getItem('adminToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      // Logout
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, resetAuth } = authSlice.actions
export default authSlice.reducer