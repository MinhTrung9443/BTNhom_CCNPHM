import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminService from '../../services/adminService'

// Async thunks
export const fetchCoupons = createAsyncThunk(
  'coupons/fetchCoupons',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllCoupons(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createCoupon = createAsyncThunk(
  'coupons/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await adminService.createCoupon(couponData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateCoupon = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ couponId, couponData }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateCoupon(couponId, couponData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteCoupon = createAsyncThunk(
  'coupons/deleteCoupon',
  async (couponId, { rejectWithValue }) => {
    try {
      await adminService.deleteCoupon(couponId)
      return couponId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchCouponStats = createAsyncThunk(
  'coupons/fetchCouponStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getCouponStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  coupons: [],
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCoupons: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  error: null,
}

const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false
        state.coupons = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create coupon
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload.data)
      })
      // Update coupon
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const updatedCoupon = action.payload.data
        const index = state.coupons.findIndex(coupon => coupon._id === updatedCoupon._id)
        if (index !== -1) {
          state.coupons[index] = updatedCoupon
        }
      })
      // Delete coupon
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(coupon => coupon._id !== action.payload)
      })
      // Fetch stats
      .addCase(fetchCouponStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
  },
})

export const { clearError } = couponsSlice.actions
export default couponsSlice.reducer