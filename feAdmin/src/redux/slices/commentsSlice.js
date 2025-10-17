import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import articleService from '../../services/articleService'

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await articleService.getAllComments(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const approveComment = createAsyncThunk(
  'comments/approveComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await articleService.approveComment(commentId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const rejectComment = createAsyncThunk(
  'comments/rejectComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await articleService.rejectComment(commentId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await articleService.deleteComment(commentId)
      return { commentId, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const bulkApproveComments = createAsyncThunk(
  'comments/bulkApproveComments',
  async (commentIds, { rejectWithValue }) => {
    try {
      const response = await articleService.bulkApproveComments(commentIds)
      return { commentIds, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const bulkRejectComments = createAsyncThunk(
  'comments/bulkRejectComments',
  async (commentIds, { rejectWithValue }) => {
    try {
      const response = await articleService.bulkRejectComments(commentIds)
      return { commentIds, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const bulkDeleteComments = createAsyncThunk(
  'comments/bulkDeleteComments',
  async (commentIds, { rejectWithValue }) => {
    try {
      const response = await articleService.bulkDeleteComments(commentIds)
      return { commentIds, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  comments: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  error: null,
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload.data
        if (action.payload.meta) {
          state.pagination = action.payload.meta
        }
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Approve comment
      .addCase(approveComment.fulfilled, (state, action) => {
        const approvedComment = action.payload.data
        const index = state.comments.findIndex(comment => comment._id === approvedComment._id)
        if (index !== -1) {
          state.comments[index] = approvedComment
        }
      })
      // Reject comment
      .addCase(rejectComment.fulfilled, (state, action) => {
        const rejectedComment = action.payload.data
        const index = state.comments.findIndex(comment => comment._id === rejectedComment._id)
        if (index !== -1) {
          state.comments[index] = rejectedComment
        }
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(comment => comment._id !== action.payload.commentId)
      })
      // Bulk approve
      .addCase(bulkApproveComments.fulfilled, (state, action) => {
        const { commentIds } = action.payload
        state.comments = state.comments.map(comment => 
          commentIds.includes(comment._id) 
            ? { ...comment, status: 'approved' }
            : comment
        )
      })
      // Bulk reject
      .addCase(bulkRejectComments.fulfilled, (state, action) => {
        const { commentIds } = action.payload
        state.comments = state.comments.map(comment => 
          commentIds.includes(comment._id) 
            ? { ...comment, status: 'rejected' }
            : comment
        )
      })
      // Bulk delete
      .addCase(bulkDeleteComments.fulfilled, (state, action) => {
        const { commentIds } = action.payload
        state.comments = state.comments.filter(comment => !commentIds.includes(comment._id))
      })
  },
})

export const { clearError } = commentsSlice.actions
export default commentsSlice.reducer
