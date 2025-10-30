import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import orderService from '../../services/orderService'

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(params)
      // Return only the serializable parts of the response (the actual API response body)
      return response.data; // API trả về { data: [...], meta: {...} }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data.data; // API trả về { success: true, message: "...", data: order_object }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, metadata }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(
        orderId,
        status,
        metadata
      );
      return response.data.data; // API trả về { success: true, message: "...", data: updatedOrder }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const addOrderNote = createAsyncThunk(
 'orders/addOrderNote',
  async ({ orderId, description, metadata }, { rejectWithValue }) => {
    try {
      const response = await orderService.addOrderNote(orderId, description, metadata)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchCancellationRequests = createAsyncThunk(
  'orders/fetchCancellationRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getCancellationRequests(params)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const approveCancellation = createAsyncThunk(
  'orders/approveCancellation',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.approveCancellation(orderId)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchPendingReturns = createAsyncThunk(
  'orders/fetchPendingReturns',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getPendingReturns(params)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const approveReturn = createAsyncThunk(
  'orders/approveReturn',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.approveReturn(orderId)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const getValidTransitions = createAsyncThunk(
  'orders/getValidTransitions',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getValidTransitions(orderId)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  orders: [],
  order: null, // Đổi tên cho nhất quán
  cancellationRequests: [],
  returnRequests: [],
  meta: {}, // Đổi tên cho nhất quán với API
  cancellationMeta: {},
  returnMeta: {},
  loading: false,
  error: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearOrder: (state) => {
      state.order = null;
    },
    clearCancellationRequests: (state) => {
      state.cancellationRequests = [];
    },
    clearReturnRequests: (state) => {
      state.returnRequests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.data;
        state.meta = action.payload.meta; // Cập nhật meta
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Order By Id
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        // Có thể set loading riêng cho việc update nếu cần
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.order && state.order._id === updatedOrder._id) {
          state.order = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Add order note
      .addCase(addOrderNote.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        if (state.order && state.order._id === updatedOrder._id) {
          state.order = updatedOrder;
        }
      })
      // Fetch cancellation requests
      .addCase(fetchCancellationRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCancellationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.cancellationRequests = action.payload.data;
        state.cancellationMeta = action.payload.meta;
      })
      .addCase(fetchCancellationRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve cancellation
      .addCase(approveCancellation.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        // Remove from cancellation requests
        state.cancellationRequests = state.cancellationRequests.filter(
          order => order._id !== updatedOrder._id
        );
        // Update order if it's currently loaded
        if (state.order && state.order._id === updatedOrder._id) {
          state.order = updatedOrder;
        }
      })
      // Fetch pending returns
      .addCase(fetchPendingReturns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.returnRequests = action.payload.data;
        state.returnMeta = action.payload.meta;
      })
      .addCase(fetchPendingReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve return
      .addCase(approveReturn.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        // Remove from return requests
        state.returnRequests = state.returnRequests.filter(
          order => order._id !== updatedOrder._id
        );
        // Update order if it's currently loaded
        if (state.order && state.order._id === updatedOrder._id) {
          state.order = updatedOrder;
        }
      })
  },
})

export const { clearError, clearOrder, clearCancellationRequests, clearReturnRequests } = ordersSlice.actions;
export default ordersSlice.reducer
