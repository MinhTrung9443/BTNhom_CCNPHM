import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import voucherService from '../../services/voucherService'

const extractErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Unexpected error'
}

export const fetchVouchers = createAsyncThunk(
  'vouchers/fetchVouchers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await voucherService.getVouchers(params)
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)

export const fetchVoucherDetail = createAsyncThunk(
  'vouchers/fetchVoucherDetail',
  async (voucherId, { rejectWithValue }) => {
    try {
      const response = await voucherService.getVoucherById(voucherId)
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)

export const deactivateVoucher = createAsyncThunk(
  'vouchers/deactivateVoucher',
  async (voucherId, { rejectWithValue }) => {
    try {
      const response = await voucherService.deactivateVoucher(voucherId)
      return {
        voucherId,
        response: response.data,
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)


export const createVoucher = createAsyncThunk(
  'vouchers/createVoucher',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await voucherService.createVoucher(payload)
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)

export const updateVoucher = createAsyncThunk(
  'vouchers/updateVoucher',
  async ({ voucherId, payload }, { rejectWithValue }) => {
    try {
      const response = await voucherService.updateVoucher(voucherId, payload)
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error))
    }
  }
)
const defaultPagination = {
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  hasNext: false,
  hasPrev: false,
}

const initialState = {
  items: [],
  pagination: { ...defaultPagination },
  loading: false,
  error: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  deactivatingId: null,
}

const vouchersSlice = createSlice({
  name: 'vouchers',
  initialState,
  reducers: {
    clearVoucherDetail: (state) => {
      state.detail = null
      state.detailError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || []
        state.pagination = action.payload.pagination || { ...defaultPagination }
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchVoucherDetail.pending, (state) => {
        state.detailLoading = true
        state.detailError = null
      })
      .addCase(fetchVoucherDetail.fulfilled, (state, action) => {
        state.detailLoading = false
        state.detail = action.payload.data || null
      })
      .addCase(fetchVoucherDetail.rejected, (state, action) => {
        state.detailLoading = false
        state.detailError = action.payload
      })
      .addCase(deactivateVoucher.pending, (state, action) => {
        state.deactivatingId = action.meta.arg
        state.error = null
      })
      .addCase(deactivateVoucher.fulfilled, (state, action) => {
        state.deactivatingId = null
        const voucherId = action.payload.voucherId
        const target = state.items.find((voucher) => voucher._id === voucherId)
        if (target) {
          target.isActive = false
          if (target.usageStats) {
            target.usageStats.remainingUses = 0
          }
        }

        if (state.detail?.voucher?._id === voucherId) {
          state.detail = {
            ...state.detail,
            voucher: {
              ...state.detail.voucher,
              isActive: false,
            },
          }
          if (state.detail.usageStats) {
            state.detail.usageStats = {
              ...state.detail.usageStats,
              remainingUses: 0,
            }
          }
        }
      })
      .addCase(deactivateVoucher.rejected, (state, action) => {
        state.deactivatingId = null
        state.error = action.payload
      })
  },
})

export const { clearVoucherDetail } = vouchersSlice.actions
export default vouchersSlice.reducer

