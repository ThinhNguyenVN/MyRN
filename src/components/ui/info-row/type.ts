import type { ReactNode } from 'react'

/** One "label: value" line of a detail section. */
export type InfoRowProps = {
  label: string
  value?: string | null
  /** Rendered instead of `value` (tags, links). */
  children?: ReactNode
}
