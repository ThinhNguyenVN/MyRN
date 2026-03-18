import type { ElevationToken } from '@/theme/elevation'

export const DEFAULT_DATE_LOCALE = 'vi-VN'

export type ThemeConfigsType = {
  /** Bật haptic mặc định cho pressable, wheel picker, v.v. */
  haptic: boolean
  /** Elevation mặc định cho button, alert, checkbox, sidebar, v.v. khi không truyền prop. */
  elevation: ElevationToken | 'none'
}

export const ThemeConfigs: ThemeConfigsType = {
  haptic: false,
  elevation: 'none',
}
