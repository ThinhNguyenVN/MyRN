import type { AuthState } from '@/features/auth/authSlice'

/** Minimal auth slice shape for axios / non-RTK code before full store exists */
export type RootStateWithAuth = {
  auth: AuthState
}
