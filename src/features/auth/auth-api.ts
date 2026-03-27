import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/api/axios-base-query'
import { Endpoints } from '@/configs/api'
import type { AuthUser } from '@/features/auth/auth-slice'

export type LoginResponse = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  accessToken: string
  refreshToken: string
}

export type RefreshResponse = {
  accessToken: string
  refreshToken: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { username: string; password: string }>({
      query: (body) => ({
        url: Endpoints.login,
        method: 'POST',
        data: body,
      }),
    }),
    refresh: builder.mutation<RefreshResponse, { refreshToken: string }>({
      query: (body) => ({
        url: Endpoints.refresh,
        method: 'POST',
        data: body,
      }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: Endpoints.me, method: 'GET' }),
      providesTags: ['User'],
    }),
  }),
})

export const { useLoginMutation, useRefreshMutation, useGetMeQuery, useLazyGetMeQuery } = authApi
