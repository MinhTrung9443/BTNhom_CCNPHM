import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationService from "../../services/notificationService";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.deleteNotification(
        notificationId
      );
      return { id: notificationId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    pagination: { page: 1, pages: 1, total: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.notifications || [];
        state.unreadCount = action.payload.data.unreadCount || 0;
        state.pagination = action.payload.data.pagination || {
          page: 1,
          pages: 1,
          total: 0,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(
          (n) => n._id === action.payload.data._id
        );
        if (notification) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.filter(
          (n) => n._id !== action.payload.id
        );
        if (!state.notifications.some((n) => !n.isRead)) {
          state.unreadCount = 0;
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
