import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCategories } from './redux/slices/categoriesSlice'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/users/UsersPage'
import UserDetailPage from './pages/users/UserDetailPage'
import ProductsPage from './pages/products/ProductsPage'
import ProductEditPage from './pages/products/ProductEditPage'
import OrdersPage from './pages/orders/OrdersPage'
import OrderDetailPage from './pages/orders/OrderDetailPage'
import CancellationRequestsPage from './pages/orders/CancellationRequestsPage'
import ReturnRefundRequestsPage from './pages/orders/ReturnRefundRequestsPage'
import VouchersPage from './pages/vouchers/VouchersPage'
import VoucherFormPage from './pages/vouchers/VoucherFormPage'
import CategoriesPage from './pages/categories/CategoriesPage'
import LoyaltyPointsPage from './pages/loyalty/LoyaltyPointsPage'
import SettingsPage from './pages/SettingsPage'
import Notifications from './pages/Notifications'
import ChatPage from './pages/ChatPage'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      dispatch(fetchCategories({ limit: 100 })); // Fetch all categories
    }
  }, [isAuthenticated, user, dispatch]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/:id" element={<UserDetailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/edit/:productId" element={<ProductEditPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/cancellation-requests" element={<CancellationRequestsPage />} />
                  <Route path="/orders/return-refund-requests" element={<ReturnRefundRequestsPage />} />
                  <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                  <Route path="/vouchers" element={<VouchersPage />} />
                  <Route path="/vouchers/create" element={<VoucherFormPage />} />
                  <Route path="/vouchers/edit/:id" element={<VoucherFormPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/loyalty-points" element={<LoyaltyPointsPage />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 999999 }}
      />
    </BrowserRouter>
  )
}

export default App
