export interface NotFoundScreenViewProps {
  /** Unmatched path the user opened, shown so they can spot a typo. */
  pathname: string
  primaryActionLabel: string
  onPrimaryActionPress: () => void
  /** Only when there is in-app history to return to (not on a hard load of a bad URL). */
  canGoBack: boolean
  onBackPress: () => void
}
