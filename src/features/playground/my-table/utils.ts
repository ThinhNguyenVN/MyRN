import { resolveHysteresisVisible } from '@/utils/responsive-visibility'

import { PLAYGROUND_TABLE_COLUMN_HYSTERESIS, PLAYGROUND_TABLE_HIDE_BRANCH_BELOW } from './constants'

export type PlaygroundTableColumns = {
  showBranch: boolean
}

/** `previous` MUST be passed through to apply hysteresis — see `resolveHysteresisVisible`. */
export function playgroundTableColumnVisibility(
  width: number,
  previous?: PlaygroundTableColumns,
): PlaygroundTableColumns {
  const showBranch = resolveHysteresisVisible(
    width,
    PLAYGROUND_TABLE_HIDE_BRANCH_BELOW,
    previous?.showBranch,
    PLAYGROUND_TABLE_COLUMN_HYSTERESIS,
  )
  if (previous && previous.showBranch === showBranch) {
    return previous
  }
  return { showBranch }
}
