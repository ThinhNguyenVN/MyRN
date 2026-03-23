import { configureStore } from '@reduxjs/toolkit'

import { authApi } from '@/features/auth/authApi'
import { authSlice } from '@/features/auth/authSlice'
import { injectStore } from '@/store/store-ref'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }).concat(authApi.middleware),
})

injectStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
