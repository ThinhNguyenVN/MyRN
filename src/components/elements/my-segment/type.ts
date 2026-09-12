export type MySegmentSize = 'compact' | 'default'

export type MySegmentOption<T extends string = string> = {
  value: T
  label: string
  accessibilityLabel?: string
}

export type MySegmentProps<T extends string = string> = {
  options: MySegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: MySegmentSize
  disabled?: boolean
  accessibilityLabel?: string
}

export type MySegmentItemProps<T extends string = string> = {
  option: MySegmentOption<T>
  isActive: boolean
  size: MySegmentSize
  disabled: boolean
  onSelect: (value: T) => void
}
