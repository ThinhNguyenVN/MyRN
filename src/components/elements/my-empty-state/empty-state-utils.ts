import { isNil } from 'lodash'

export function shouldShowEmptyStateSubtitle(subtitle: string | undefined): boolean {
  return !isNil(subtitle) && subtitle !== ''
}

export function shouldShowEmptyStateAction(
  actionLabel: string | undefined,
  onActionPress: (() => void) | undefined,
): boolean {
  return !isNil(actionLabel) && actionLabel !== '' && !isNil(onActionPress)
}
