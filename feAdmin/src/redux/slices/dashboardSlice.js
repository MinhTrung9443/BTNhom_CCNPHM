import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

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

// === NEW ASYNC THUNKS ===
export const fetchCashFlowStats = createAsyncThunk(
  'dashboard/fetchCashFlowStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getCashFlowStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'dashboard/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getTopProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDeliveredOrders = createAsyncThunk(
  'dashboard/fetchDeliveredOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDeliveredOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  stats: { },
  recentOrders: [],
  salesChart: {
    labels: [],
    datasets: [],
  },
  cashFlow: {
    shipping: { totalAmount: 0, count: 0 },
    completed: { totalAmount: 0, count: 0 },
  },
  topProducts: [],
  deliveredOrders: {
    orders: [],
    pagination: {},
  },
  loading: false,
  loadingCashFlow: false,
  loadingTopProducts: false,
  loadingDeliveredOrders: false,
  error: null,
};

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
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch recent orders
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload.data;
      })
      // Fetch sales chart
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.salesChart = action.payload.data;
      })
      // === NEW CASES for fetchCashFlowStats ===
      .addCase(fetchCashFlowStats.pending, (state) => {
        state.loadingCashFlow = true;
      })
      .addCase(fetchCashFlowStats.fulfilled, (state, action) => {
        state.loadingCashFlow = false;
        state.cashFlow = action.payload.data;
      })
      .addCase(fetchCashFlowStats.rejected, (state, action) => {
        state.loadingCashFlow = false;
        state.error = action.payload;
      })
      // === NEW CASES for fetchTopProducts ===
      .addCase(fetchTopProducts.pending, (state) => {
        state.loadingTopProducts = true;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loadingTopProducts = false;
        state.topProducts = action.payload.data;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loadingTopProducts = false;
        state.error = action.payload;
      })
      // === NEW CASES for fetchDeliveredOrders ===
      .addCase(fetchDeliveredOrders.pending, (state) => {
        state.loadingDeliveredOrders = true;
      })
      .addCase(fetchDeliveredOrders.fulfilled, (state, action) => {
        state.loadingDeliveredOrders = false;
        state.deliveredOrders.orders = action.payload.data;
        state.deliveredOrders.pagination = action.payload.meta;
      })
      .addCase(fetchDeliveredOrders.rejected, (state, action) => {
        state.loadingDeliveredOrders = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;