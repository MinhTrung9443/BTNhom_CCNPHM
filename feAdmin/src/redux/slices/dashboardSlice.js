import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dashboardService from '../../services/dashboardService'

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchRecentOrders = createAsyncThunk(
  'dashboard/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentOrders()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchSalesChart = createAsyncThunk(
  'dashboard/fetchSalesChart',
  async (period = '7d', { rejectWithValue }) => {
    try {
      const response = await dashboardService.getSalesChart(period)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  stats: {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    newUsersToday: 0,
    ordersToday: 0,
    revenueToday: 0,
  },
  recentOrders: [],
  salesChart: {
    labels: [],
    datasets: [],
  },
  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch recent orders
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload.data
      })
      // Fetch sales chart
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.salesChart = action.payload.data
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer