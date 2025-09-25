import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../services/cartService';

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (itemData, { rejectWithValue, dispatch }) => {
    try {
      await cartService.addToCart(itemData);
      // After adding, fetch the updated cart
      const cartData = await cartService.getCart();
      return cartData;
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
      await cartService.updateCartItem({ productId, quantity });
      // After updating, fetch the updated cart
      const cartData = await cartService.getCart();
      return cartData;
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
      await cartService.removeFromCart(productId);
      // After removing, fetch the updated cart
      const cartData = await cartService.getCart();
      return cartData;
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
            const cartData = await cartService.getCart();
            return cartData;
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
        cartId: null,
        userId: null,
    },
    reducers: {
        clearCartState: (state) => {
            state.items = [];
            state.status = 'idle';
            state.error = null;
            state.cartId = null;
            state.userId = null;
        },
    },
    extraReducers: (builder) => {
        builder

            .addMatcher(
                (action) => action.type.endsWith('/fulfilled'),
                (state, action) => {
                    state.status = 'succeeded';
                    if (action.payload) {
                        state.items = action.payload.items || [];
                        state.cartId = action.payload._id;
                        state.userId = action.payload.userId;
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

export const { clearCartState } = cartSlice.actions;

export default cartSlice.reducer;