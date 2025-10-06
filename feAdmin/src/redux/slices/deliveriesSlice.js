import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import deliveryService from "../../services/deliveryService";

export const fetchDeliveries = createAsyncThunk(
  "deliveries/fetchDeliveries",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getDeliveries(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createDelivery = createAsyncThunk(
  "deliveries/createDelivery",
  async (deliveryData, { rejectWithValue }) => {
    try {
      const response = await deliveryService.createDelivery(deliveryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateDelivery = createAsyncThunk(
  "deliveries/updateDelivery",
  async ({ deliveryId, deliveryData }, { rejectWithValue }) => {
    try {
      const response = await deliveryService.updateDelivery(deliveryId, deliveryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteDelivery = createAsyncThunk(
  "deliveries/deleteDelivery",
  async (deliveryId, { rejectWithValue }) => {
    try {
      const response = await deliveryService.deleteDelivery(deliveryId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  deliveries: [],
  pagination: {},
  loading: false,
  error: null,
};

const deliveriesSlice = createSlice({
  name: "deliveries",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveries = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDelivery.fulfilled, (state, action) => {
        state.deliveries.unshift(action.payload.data);
      })
      .addCase(updateDelivery.fulfilled, (state, action) => {
        const index = state.deliveries.findIndex(
          (delivery) => delivery._id === action.payload.data._id
        );
        if (index !== -1) {
          state.deliveries[index] = action.payload.data;
        }
      })
      .addCase(deleteDelivery.fulfilled, (state, action) => {
        state.deliveries = state.deliveries.filter(
          (delivery) => delivery._id !== action.meta.arg
        );
      });
  },
});

export const { clearError } = deliveriesSlice.actions;
export default deliveriesSlice.reducer;
