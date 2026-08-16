import { useCallback, useState } from 'react'
import type {
  FieldPath,
  FieldValues,
  UseFormGetFieldState,
  UseFormSetFocus,
  UseFormTrigger,
} from 'react-hook-form'

export type UseFormWizardStepsParams<TFieldValues extends FieldValues> = {
  mode: 'create' | 'edit'
  stepCount: number
  fieldsForStep: (step: number) => FieldPath<TFieldValues>[]
  trigger: UseFormTrigger<TFieldValues>
  getFieldState: UseFormGetFieldState<TFieldValues>
  setFocus: UseFormSetFocus<TFieldValues>
  scrollToField: (name: string) => void
}

export function useFormWizardSteps<TFieldValues extends FieldValues>({
  mode,
  stepCount,
  fieldsForStep,
  trigger,
  getFieldState,
  setFocus,
  scrollToField,
}: UseFormWizardStepsParams<TFieldValues>) {
  const [step, setStep] = useState(0)
  const [maxReached, setMaxReached] = useState(0)

  const isFirstStep = step === 0
  const isLastStep = step === stepCount - 1

  const focusFirstInvalid = useCallback(
    (fields: FieldPath<TFieldValues>[]) => {
      for (const name of fields) {
        const state = getFieldState(name)
        if (state.error) {
          scrollToField(name)
          setFocus(name)
          return
        }
      }
    },
    [getFieldState, scrollToField, setFocus],
  )

  const goToStep = useCallback(
    (target: number) => {
      if (mode === 'edit') {
        setStep(target)
        setMaxReached((prev) => (target > prev ? target : prev))
        return
      }
      if (target <= maxReached) {
        setStep(target)
      }
    },
    [maxReached, mode],
  )

  const goBack = useCallback(() => {
    setStep((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  const goNext = useCallback(async () => {
    const fields = fieldsForStep(step)
    if (fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) {
        focusFirstInvalid(fields)
        return false
      }
    }
    if (isLastStep) {
      return true
    }
    const next = step + 1
    setStep(next)
    setMaxReached((prev) => (next > prev ? next : prev))
    return true
  }, [fieldsForStep, focusFirstInvalid, isLastStep, step, trigger])

  return {
    step,
    maxReached,
    isFirstStep,
    isLastStep,
    goToStep,
    goBack,
    goNext,
  }
}
