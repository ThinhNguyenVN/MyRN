import { memo, useCallback, useState } from 'react'
import { type LayoutChangeEvent } from 'react-native'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { connectorFrame } from './utils'
import { StepConnector } from './step-connector'
import { StepItem } from './step-item'
import { generateStyles } from './styles'
import type { StepperProps } from './type'

function StepperComponent({
  steps,
  activeStep,
  maxReached,
  allowJump = false,
  onStepPress,
  style,
}: StepperProps) {
  const styles = useThemedStyles(generateStyles)
  const [rowWidth, setRowWidth] = useState(0)
  const reachableMax = maxReached ?? activeStep
  const stepCount = steps.length

  const handleRowLayout = useCallback((event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width)
  }, [])

  const handleStepPress = useCallback(
    (stepIndex: number) => {
      onStepPress?.(stepIndex)
    },
    [onStepPress],
  )

  return (
    <MyView style={[styles.root, style]}>
      <MyView style={styles.row} onLayout={handleRowLayout}>
        <MyView style={styles.connectorsLayer} pointerEvents="none">
          {steps.slice(1).map((_, index) => {
            const segmentIndex = index
            const destinationStep = index + 1
            const frame = connectorFrame(rowWidth, stepCount, segmentIndex)
            if (!frame) {
              return null
            }
            return (
              <StepConnector
                key={`stepper-connector-${segmentIndex}`}
                filled={activeStep >= destinationStep}
                style={frame}
              />
            )
          })}
        </MyView>

        {steps.map((title, index) => {
          const active = index === activeStep
          const completed = index < activeStep
          const reachable = allowJump || index <= reachableMax
          return (
            <StepItem
              key={`stepper-step-${index}`}
              index={index}
              active={active}
              completed={completed}
              reachable={reachable}
              title={title}
              onPress={handleStepPress}
            />
          )
        })}
      </MyView>
    </MyView>
  )
}

export default memo(StepperComponent)
