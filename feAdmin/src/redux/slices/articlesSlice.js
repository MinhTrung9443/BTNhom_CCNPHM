import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import articleService from '../../services/articleService'

// Async thunks
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await articleService.getAllArticles(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchArticleById = createAsyncThunk(
  'articles/fetchArticleById',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await articleService.getArticleById(articleId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createArticle = createAsyncThunk(
  'articles/createArticle',
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await articleService.createArticle(articleData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateArticle = createAsyncThunk(
  'articles/updateArticle',
  async ({ articleId, articleData }, { rejectWithValue }) => {
    try {
      const response = await articleService.updateArticle(articleId, articleData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await articleService.deleteArticle(articleId)
      return { articleId, ...response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const publishArticle = createAsyncThunk(
  'articles/publishArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await articleService.publishArticle(articleId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const unpublishArticle = createAsyncThunk(
  'articles/unpublishArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await articleService.unpublishArticle(articleId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchArticleAnalytics = createAsyncThunk(
  'articles/fetchArticleAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await articleService.getArticleAnalytics()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  articles: [],
  currentArticle: null,
  analytics: null,
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

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false
        state.articles = action.payload.data
        if (action.payload.meta) {
          state.pagination = action.payload.meta
        }
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch article by ID
      .addCase(fetchArticleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.loading = false
        state.currentArticle = action.payload.data
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create article
      .addCase(createArticle.fulfilled, (state, action) => {
        state.articles.unshift(action.payload.data)
      })
      // Update article
      .addCase(updateArticle.fulfilled, (state, action) => {
        const updatedArticle = action.payload.data
        const index = state.articles.findIndex(article => article._id === updatedArticle._id)
        if (index !== -1) {
          state.articles[index] = updatedArticle
        }
        if (state.currentArticle?._id === updatedArticle._id) {
          state.currentArticle = updatedArticle
        }
      })
      // Delete article
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.articles = state.articles.filter(article => article._id !== action.payload.articleId)
      })
      // Publish article
      .addCase(publishArticle.fulfilled, (state, action) => {
        const publishedArticle = action.payload.data
        const index = state.articles.findIndex(article => article._id === publishedArticle._id)
        if (index !== -1) {
          state.articles[index] = publishedArticle
        }
        if (state.currentArticle?._id === publishedArticle._id) {
          state.currentArticle = publishedArticle
        }
      })
      // Unpublish article
      .addCase(unpublishArticle.fulfilled, (state, action) => {
        const unpublishedArticle = action.payload.data
        const index = state.articles.findIndex(article => article._id === unpublishedArticle._id)
        if (index !== -1) {
          state.articles[index] = unpublishedArticle
        }
        if (state.currentArticle?._id === unpublishedArticle._id) {
          state.currentArticle = unpublishedArticle
        }
      })
      // Fetch analytics
      .addCase(fetchArticleAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchArticleAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.analytics = action.payload.data
      })
      .addCase(fetchArticleAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentArticle } = articlesSlice.actions
export default articlesSlice.reducer
