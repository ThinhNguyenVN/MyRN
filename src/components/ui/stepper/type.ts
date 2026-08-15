import type { StyleProp, ViewStyle } from 'react-native'

export type StepperProps = {
  /** Step titles — length defines the step count. */
  steps: string[]
  /** Zero-based active step index. */
  activeStep: number
  /**
   * Highest step index the user may open (inclusive).
   * Defaults to `activeStep`. Ignored when `allowJump` is true.
   */
  maxReached?: number
  /** When true, every step is tappable. */
  allowJump?: boolean
  onStepPress?: (stepIndex: number) => void
  style?: StyleProp<ViewStyle>
}

export type StepItemProps = {
  index: number
  active: boolean
  completed: boolean
  reachable: boolean
  title: string
  onPress: (stepIndex: number) => void
}

export type StepConnectorProps = {
  filled: boolean
  style: StyleProp<ViewStyle>
}
