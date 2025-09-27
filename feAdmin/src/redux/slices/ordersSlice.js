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

const initialState = {
  orders: [],
  order: null, // Đổi tên cho nhất quán
  meta: {}, // Đổi tên cho nhất quán với API
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
  },
})

export const { clearError, clearOrder } = ordersSlice.actions;
export default ordersSlice.reducer
