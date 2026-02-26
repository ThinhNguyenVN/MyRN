import React from 'react'

export type ConditionRendererProps = {
  when?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}
