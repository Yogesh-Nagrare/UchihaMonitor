import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      const toast = {
        id: Date.now().toString(),
        type: 'info',
        duration: 3000,
        ...action.payload,
      }
      state.toasts.push(toast)
      // Max 5 toasts
      if (state.toasts.length > 5) state.toasts.shift()
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer

// Helper thunk — use this everywhere
export const toast = (message, type = 'info', title = '') => addToast({ message, type, title })