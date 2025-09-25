import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/apiClient';

export const getProductReviews = createAsyncThunk(
  'reviews/getProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data.reviews;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUserReviews = createAsyncThunk(
  'reviews/getUserReviews',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/user/${userId}`);
      return response.data.reviews;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const createReview = createAsyncThunk(
  'reviews/createReview',
  async ({ productId, orderId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post('/reviews', { productId, orderId, rating, comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    byProduct: {},
    byUser: [],
    eligibleProducts: [],
    ui: {
      loading: false,
      error: null,
      submitting: false,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductReviews.pending, (state) => {
        state.ui.loading = true;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.ui.loading = false;
        const productId = action.meta.arg;
        state.byProduct[productId] = action.payload;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.ui.loading = false;
        state.ui.error = action.payload;
      })
      .addCase(getUserReviews.pending, (state) => {
        state.ui.loading = true;
      })
      .addCase(getUserReviews.fulfilled, (state, action) => {
        state.ui.loading = false;
        state.byUser = action.payload;
      })
      .addCase(getUserReviews.rejected, (state, action) => {
        state.ui.loading = false;
        state.ui.error = action.payload;
      })
      .addCase(createReview.pending, (state) => {
        state.ui.submitting = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.ui.submitting = false;
        const { review } = action.payload;
        if (state.byProduct[review.productId]) {
          state.byProduct[review.productId].unshift(review);
        } else {
          state.byProduct[review.productId] = [review];
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.ui.submitting = false;
        state.ui.error = action.payload;
      })
      .addCase(updateReview.pending, (state) => {
        state.ui.submitting = true;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.ui.submitting = false;
        const { review: updatedReview } = action.payload;
        
        // Update in byUser array
        const index = state.byUser.findIndex((r) => r._id === updatedReview._id);
        if (index !== -1) {
          state.byUser[index] = { ...state.byUser[index], ...updatedReview };
        }

        // Update in byProduct if it exists
        const { productId } = updatedReview;
        if (state.byProduct[productId]) {
          const productReviewIndex = state.byProduct[productId].findIndex(
            (r) => r._id === updatedReview._id
          );
          if (productReviewIndex !== -1) {
            state.byProduct[productId][productReviewIndex] = {
              ...state.byProduct[productId][productReviewIndex],
              ...updatedReview,
            };
          }
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.ui.submitting = false;
        state.ui.error = action.payload;
      });
  },
});

export default reviewSlice.reducer;