import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminService from '../../services/adminService'

// Async thunks
export const fetchLoyaltyPoints = createAsyncThunk(
  'loyalty/fetchLoyaltyPoints',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllLoyaltyPoints(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const adjustUserPoints = createAsyncThunk(
  'loyalty/adjustUserPoints',
  async ({ userId, points, transactionType, description, metadata }, { rejectWithValue }) => {
    try {
      const response = await adminService.adjustUserPoints(userId, {
        points,
        transactionType,
        description,
        metadata
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchLoyaltyStats = createAsyncThunk(
  'loyalty/fetchLoyaltyStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getLoyaltyStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const expirePoints = createAsyncThunk(
  'loyalty/expirePoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.expirePoints()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  transactions: [],
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  error: null,
}

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loyalty points
      .addCase(fetchLoyaltyPoints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLoyaltyPoints.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchLoyaltyPoints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Adjust user points
      .addCase(adjustUserPoints.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload.data)
      })
      // Fetch stats
      .addCase(fetchLoyaltyStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
      // Expire points
      .addCase(expirePoints.fulfilled, (state, action) => {
        // Refresh the transactions list after expiring points
      })
  },
})

export const { clearError } = loyaltySlice.actions
export default loyaltySlice.reducer