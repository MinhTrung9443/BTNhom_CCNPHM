import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import cartReducer from "./cartSlice";
import orderReducer from "./orderSlice";
import reviewReducer from "./reviewSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    order: orderReducer,
    reviews: reviewReducer,
  },
});
