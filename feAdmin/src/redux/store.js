import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import usersSlice from './slices/usersSlice'
import productsSlice from './slices/productsSlice'
import ordersSlice from './slices/ordersSlice'
import vouchersSlice from './slices/vouchersSlice'
import loyaltySlice from './slices/loyaltySlice'
import dashboardSlice from './slices/dashboardSlice'
import notificationsSlice from './slices/notificationsSlice'
import categoriesSlice from './slices/categoriesSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    products: productsSlice,
    orders: ordersSlice,
    vouchers: vouchersSlice,
    loyalty: loyaltySlice,
    dashboard: dashboardSlice,
    notifications: notificationsSlice,
    categories: categoriesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

