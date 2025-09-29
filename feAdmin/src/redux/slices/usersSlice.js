import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminService from '../../services/adminService'

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllUsers(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateUserRole = createAsyncThunk(
  'users/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUserRole(userId, role)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.toggleUserStatus(userId)
      return { userId, isActive: response.data.data.isActive }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  users: [],
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.data
        const index = state.users.findIndex(user => user._id === updatedUser._id)
        if (index !== -1) {
          state.users[index] = updatedUser
        }
      })
      // Toggle user status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload
        const index = state.users.findIndex(user => user._id === userId)
        if (index !== -1) {
          state.users[index].isActive = isActive
        }
      })
      // Fetch stats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
  },
})

export const { clearError } = usersSlice.actions
export default usersSlice.reducer