/** Card pressability is determined by presence of onPress. */
export function isCardPressable(onPress: (() => void) | undefined): boolean {
  return typeof onPress === 'function'
}
