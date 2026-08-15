import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { Stepper } from '@/components/ui/stepper'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function StepperScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [maxReached, setMaxReached] = useState(0)

  const steps = useMemo(
    () => [
      t('playground.stepperStepInfo'),
      t('playground.stepperStepPrice'),
      t('playground.stepperStepImage'),
    ],
    [t],
  )

  const handleStepPress = useCallback((index: number) => {
    setStep(index)
    setMaxReached((prev) => (index > prev ? index : prev))
  }, [])

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setStep((prev) => {
      const next = Math.min(steps.length - 1, prev + 1)
      setMaxReached((max) => (next > max ? next : max))
      return next
    })
  }, [steps.length])

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.stepperIntro')}
      </MyText>
      <Stepper
        steps={steps}
        activeStep={step}
        maxReached={maxReached}
        allowJump
        onStepPress={handleStepPress}
      />
      <MyText typography="subtitle">{t('playground.stepperActive', { step: step + 1 })}</MyText>
      <MyView style={styles.buttonRow}>
        <MyButton text={t('playground.stepperBack')} type="secondary" onPress={handleBack} />
        <MyButton text={t('playground.stepperNext')} type="primary" onPress={handleNext} />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
