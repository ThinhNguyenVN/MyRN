import type { ReactNode } from 'react'

import type { RadiusType } from '@/theme/radius'

export type MySectionCardProps = {
  title?: string
  children: ReactNode
  /** @default 'large' */
  radius?: RadiusType
  /** Override the default content gap (`getSpacing('x6')`). */
  gap?: number
}
