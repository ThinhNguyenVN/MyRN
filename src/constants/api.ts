import { CreateAxiosDefaults } from 'axios'
import { getEnv } from '@/utils/env'

export const API_TIMEOUT = 30_000

export const API_BASE_URL = getEnv('EXPO_PUBLIC_API_BASE_URL')

export const API_AXIOS_CONFIG: CreateAxiosDefaults = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
}

export const Endpoints = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  me: '/auth/me',
  todos: '/todos',
  addTodo: '/todos/add',
  todoById: (id: number | string) => `/todos/${id}`,
  todosByUser: (userId: number | string) => `/todos/user/${userId}`,
}

export const AUTH_SKIP_REFRESH_PATHS = [Endpoints.login, Endpoints.refresh] as const
