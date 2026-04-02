import axios, { AxiosHeaders } from 'axios'

import { API_AXIOS_CONFIG, API_BASE_URL, API_TIMEOUT, Endpoints } from '@/constants/api'

export type RefreshTokenResponse = {
  accessToken: string
  refreshToken: string
}

export async function refreshAuthToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const res = await axios.post<RefreshTokenResponse>(
    `${API_BASE_URL}${Endpoints.refresh}`,
    { refreshToken },
    { headers: API_AXIOS_CONFIG.headers as AxiosHeaders, timeout: API_TIMEOUT },
  )

  return res.data
}
