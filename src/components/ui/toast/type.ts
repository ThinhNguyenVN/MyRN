import type { ElevationToken } from '@/theme/elevation'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastOptions {
  text: string
  description?: string
  type?: ToastType
  /** Auto hide after ms. Default 2000 */
  duration?: number
  /** Optional. When set, toast uses MySurface with this elevation. */
  elevation?: ElevationToken | 'none'
}

export interface ToastRef {
  show: (options: ToastOptions) => void
  hide: () => void
}
