import { PublicEnvKey } from '@/types/env'

export function getEnv(key: PublicEnvKey, defaultValue?: string): string | undefined {
  let value: string | undefined
  switch (key) {
    case 'EXPO_PUBLIC_APP_ENV':
      value = process.env.EXPO_PUBLIC_APP_ENV
      break
    case 'EXPO_PUBLIC_API_BASE_URL':
      value = process.env.EXPO_PUBLIC_API_BASE_URL
      break
    case 'EXPO_PUBLIC_ENABLE_REQUEST_LOG':
      value = process.env.EXPO_PUBLIC_ENABLE_REQUEST_LOG
      break
    case 'EXPO_PUBLIC_SUPPORT_EMAIL':
      value = process.env.EXPO_PUBLIC_SUPPORT_EMAIL
      break
  }
  if (!value) return defaultValue
  const trimmed = value.trim()
  if (trimmed.length === 0) return defaultValue
  return trimmed
}
