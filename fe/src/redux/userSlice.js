import { createSlice } from "@reduxjs/toolkit";

// Function to safely parse JSON from localStorage
const getInitialUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};

const initialUser = getInitialUser();

const initialState = {
  user: initialUser,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loyaltyPoints: initialUser?.loyaltyPoints || 0, // Điểm tích lũy của user
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.accessToken = token;
      state.isAuthenticated = true;
      state.loyaltyPoints = user.loyaltyPoints || 0;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loyaltyPoints = 0;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    },
    updateUser: (state, action) => {
      // Merge new user data with existing user data
      const updatedUser = { ...state.user, ...action.payload };
      state.user = updatedUser;
      
      // Update loyaltyPoints if provided
      if (action.payload.loyaltyPoints !== undefined) {
        state.loyaltyPoints = action.payload.loyaltyPoints;
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
    },
    updateUserFavorites: (state, action) => {
      // Chỉ thực hiện khi người dùng đã đăng nhập
      if (state.user && state.user.favorites) {
        const { productId, add } = action.payload;

        if (add) {
          // Thêm productId vào mảng favorites (dùng push hoặc unshift)
          // Kiểm tra để không thêm trùng lặp
          if (!state.user.favorites.includes(productId)) {
            state.user.favorites.push(productId);
          }
        } else {
          // Xóa productId khỏi mảng favorites
          state.user.favorites = state.user.favorites.filter(
            (id) => id !== productId
          );
        }
      }
    },
    updateLoyaltyPoints: (state, action) => {
      // Cập nhật điểm tích lũy
      state.loyaltyPoints = action.payload;
      
      // Cập nhật trong user object nếu có
      if (state.user) {
        state.user.loyaltyPoints = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { loginSuccess, logoutSuccess, updateUser, updateUserFavorites, updateLoyaltyPoints } = userSlice.actions;

export default userSlice.reducer;
