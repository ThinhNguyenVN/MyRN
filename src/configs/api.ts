import { CreateAxiosDefaults } from 'axios'

export const API_TIMEOUT = 30_000

export const API_BASE_URL = 'https://dummyjson.com'

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
}

export const AUTH_SKIP_REFRESH_PATHS = [Endpoints.login, Endpoints.refresh] as const
