import type { ElevationToken } from '@/theme/elevation'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastOptions {
  text: string
  description?: string
  type?: ToastType
  duration?: number
  elevation?: ElevationToken | 'none'
}

export interface ToastRef {
  show: (options: ToastOptions) => void
  hide: () => void
}
