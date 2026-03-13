import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../services/apiSlice'
import authReducer from '../features/auth/authSlice'
import collectionReducer from '../features/collection/collectionSlice'
import requestReducer from '../features/request/requestSlice'
import environmentReducer from '../features/environment/environmentSlice'
import historyReducer from '../features/history/historySlice'
import { saveState } from '../features/request/requestSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    collection: collectionReducer,
    request: requestReducer,
    environment: environmentReducer,
    history: historyReducer,
    ui: uiReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

// Auto-save tabs to localStorage on every state change
// Throttle to avoid too many writes
let saveTimeout = null
store.subscribe(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveState(store.getState().request)
  }, 300)
})