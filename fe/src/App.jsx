import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useSelector } from 'react-redux'
import ErrorBoundary from './components/common/ErrorBoundary'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginPage from './pages/auth/LoginPage'
import Register from './pages/auth/Register'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderStatsPage from './pages/OrderStatsPage'
import OrderPreviewPage from './pages/OrderPreviewPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import IntroPage from "./pages/IntroPage";
import UserReviewsPage from './pages/UserReviewsPage';
import FavoritesPage from './pages/FavoritesPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/order-preview" element={<OrderPreviewPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/intro" element={<IntroPage />} />



          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/stats"
            element={
              <ProtectedRoute>
                <OrderStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reviews"
            element={
              <ProtectedRoute>
                <UserReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Layout>
      </ErrorBoundary>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ 
          zIndex: 999999,
          fontSize: '16px',
          position: 'fixed',
          top: '20px'
        }}
        toastStyle={{
          borderRadius: '8px',
          fontWeight: '500'
        }}
      />
    </BrowserRouter>
  )
}

export default App