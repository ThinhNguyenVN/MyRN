export type MySegmentSize = 'compact' | 'default'

export type MySegmentOption<T extends string = string> = {
  value: T
  label: string
  /** Short tag after the label, e.g. a saving (`-17%`). */
  badge?: string
  accessibilityLabel?: string
}

export type MySegmentProps<T extends string = string> = {
  options: MySegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: MySegmentSize
  /**
   * Stretch the track to parent width and give each option equal flex
   * (tab bars). Default hugs content (locale switch).
   */
  fill?: boolean
  disabled?: boolean
  accessibilityLabel?: string
}

export type MySegmentItemProps<T extends string = string> = {
  option: MySegmentOption<T>
  isActive: boolean
  size: MySegmentSize
  fill: boolean
  disabled: boolean
  onSelect: (value: T) => void
  onMeasure: (value: T, layout: SegmentSlot) => void
}

/** Where an option sits in the track, so the pill can slide to its real size. */
export type SegmentSlot = { x: number; width: number }
