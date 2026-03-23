import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/api/axios-base-query'
import { Endpoints } from '@/configs/api'
import type { AuthUser } from '@/features/auth/authSlice'
import { setCredentials } from '@/features/auth/authSlice'

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

function loginResponseToUser(data: LoginResponse): AuthUser {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    image: data.image,
  }
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const payload = data
          dispatch(
            setCredentials({
              accessToken: payload.accessToken,
              refreshToken: payload.refreshToken,
              user: loginResponseToUser(payload),
            }),
          )
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log('Error login mutation ', err)
        }
      },
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: Endpoints.me, method: 'GET' }),
      providesTags: ['User'],
    }),
  }),
})

export const { useLoginMutation, useGetMeQuery, useLazyGetMeQuery } = authApi
