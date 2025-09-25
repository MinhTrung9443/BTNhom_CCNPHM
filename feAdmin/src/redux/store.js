import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import usersSlice from './slices/usersSlice'
import productsSlice from './slices/productsSlice'
import ordersSlice from './slices/ordersSlice'
import couponsSlice from './slices/couponsSlice'
import loyaltySlice from './slices/loyaltySlice'
import dashboardSlice from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    products: productsSlice,
    orders: ordersSlice,
    coupons: couponsSlice,
    loyalty: loyaltySlice,
    dashboard: dashboardSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})