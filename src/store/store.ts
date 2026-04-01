import { configureStore } from '@reduxjs/toolkit'

import { authApi } from '@/features/auth/auth-api'
import { authSlice } from '@/features/auth/auth-slice'
import { todoApi } from '@/features/todo/todo-api'
import { injectStore } from '@/store/store-ref'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [todoApi.reducerPath]: todoApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }).concat(authApi.middleware, todoApi.middleware),
})

injectStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
