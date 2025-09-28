import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from '../../services/productService'

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(productId, productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productService.deleteProduct(productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  products: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  error: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.data.products
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload.data)
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload.data
        const index = state.products.findIndex(product => product._id === updatedProduct._id)
        if (index !== -1) {
          state.products[index] = updatedProduct
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const { productId, product, softDeleted } = action.payload;
        if (softDeleted) {
          // Soft delete: update the product in the list
          const index = state.products.findIndex(p => p._id === product._id);
          if (index !== -1) {
            state.products[index] = product;
          }
        } else {
          // Hard delete: remove the product from the list
          state.products = state.products.filter(p => p._id !== productId);
        }
      })
  },
})

export const { clearError } = productsSlice.actions
export default productsSlice.reducer