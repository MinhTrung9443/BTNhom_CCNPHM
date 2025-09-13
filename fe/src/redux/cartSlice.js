import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/cart/items', itemData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue({ message: error.message });
      }
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/cart/items', { productId, quantity });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue({ message: error.message });
      }
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue({ message: error.message });
      }
    }
  }
);

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.get('/cart'); 
            return response.data; 
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: error.message });
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        clearCart: (state) => {
            state.items = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            .addMatcher(
                (action) => action.type.endsWith('/fulfilled'),
                (state, action) => {
                    state.status = 'succeeded';
                    if (action.payload && action.payload.items) {
                        state.items = action.payload.items;
                    }
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state, action) => {
                    state.status = 'loading';
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.status = 'failed';
                    state.error = action.payload ? action.payload.message : action.error.message;
                }
            );
    },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;