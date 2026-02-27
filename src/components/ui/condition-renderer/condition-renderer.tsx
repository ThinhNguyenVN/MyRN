import { memo } from 'react'

import type { ConditionRendererProps } from './types'

const ConditionRenderer: React.FC<ConditionRendererProps> = ({ when, children, fallback }) =>
  when ? children : (fallback ?? null)

export default memo(ConditionRenderer)
