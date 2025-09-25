// src/redux/orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Order creation state
  orderLines: [],
  
  // Order management state
  orders: {
    items: [],
    pagination: {
      current: 1,
      limit: 5,
      total: 0,
      totalOrders: 0
    },
    stats: {
      new: { count: 0 },
      confirmed: { count: 0 },
      preparing: { count: 0 },
      shipping: { count: 0 },
      delivered: { count: 0 },
      completed: { count: 0 },
      cancelled: { count: 0 },
      cancellation_requested: { count: 0 }
    },
    filters: {
      status: '',
      search: '',
      page: 1
    },
    loading: false,
    error: null
  },
  
  // Current order detail
  currentOrder: {
    data: null,
    loading: false,
    error: null
  }
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Order creation reducers
    setOrderLines(state, action) {
      state.orderLines = action.payload;
    },
    clearOrder(state) {
      state.orderLines = [];
    },
    
    // Order management reducers
    setOrdersLoading(state, action) {
      state.orders.loading = action.payload;
    },
    setOrdersError(state, action) {
      state.orders.error = action.payload;
    },
    setOrders(state, action) {
      state.orders.items = action.payload.data || [];
      state.orders.pagination = action.payload.pagination || state.orders.pagination;
      state.orders.loading = false;
      state.orders.error = null;
    },
    setOrderStats(state, action) {
      state.orders.stats = { ...state.orders.stats, ...action.payload };
    },
    setOrderFilters(state, action) {
      state.orders.filters = { ...state.orders.filters, ...action.payload };
    },
    updateOrderInList(state, action) {
      const { orderId, updatedOrder } = action.payload;
      const index = state.orders.items.findIndex(order => order._id === orderId);
      if (index !== -1) {
        state.orders.items[index] = { ...state.orders.items[index], ...updatedOrder };
      }
    },
    
    // Current order detail reducers
    setCurrentOrderLoading(state, action) {
      state.currentOrder.loading = action.payload;
    },
    setCurrentOrderError(state, action) {
      state.currentOrder.error = action.payload;
    },
    setCurrentOrder(state, action) {
      state.currentOrder.data = action.payload;
      state.currentOrder.loading = false;
      state.currentOrder.error = null;
    },
    clearCurrentOrder(state) {
      state.currentOrder = {
        data: null,
        loading: false,
        error: null
      };
    }
  },
});

export const {
  // Order creation actions
  setOrderLines,
  clearOrder,
  
  // Order management actions
  setOrdersLoading,
  setOrdersError,
  setOrders,
  setOrderStats,
  setOrderFilters,
  updateOrderInList,
  
  // Current order detail actions
  setCurrentOrderLoading,
  setCurrentOrderError,
  setCurrentOrder,
  clearCurrentOrder
} = orderSlice.actions;

export default orderSlice.reducer;
