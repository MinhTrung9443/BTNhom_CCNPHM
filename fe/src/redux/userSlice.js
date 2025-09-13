import { createSlice } from '@reduxjs/toolkit';

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

const initialState = {
  user: getInitialUser(),
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.accessToken = token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    },
    updateUser: (state, action) => {
      // Merge new user data with existing user data
      const updatedUser = { ...state.user, ...action.payload };
      state.user = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    },
  },
});

export const { loginSuccess, logoutSuccess, updateUser } = userSlice.actions;

export default userSlice.reducer;