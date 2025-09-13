// src/redux/orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderLines: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderLines(state, action) {
      state.orderLines = action.payload;
    },
    clearOrder(state) {
      state.orderLines = [];
    },
  },
});

export const { setOrderLines, clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
