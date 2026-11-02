import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { OtpCodeInput, type OtpCodeInputHandle } from '@/components/ui/otp-code-input'
import { formatCountdown, useCountdown } from '@/hooks/use-countdown'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

/** Demo code: anything else counts as wrong. */
const DEMO_CODE = '123456'
const RESEND_SECONDS = 30

export default function OtpCodeInputScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const inputRef = useRef<OtpCodeInputHandle>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resendAt, setResendAt] = useState<number | null>(() => Date.now() + RESEND_SECONDS * 1000)
  const secondsLeft = useCountdown(resendAt)

  const handleChange = useCallback((value: string) => {
    setCode(value)
    setError(false)
    setVerified(false)
  }, [])

  const handleComplete = useCallback((value: string) => {
    if (value === DEMO_CODE) {
      setVerified(true)
      return
    }
    setError(true)
    setCode('')
    inputRef.current?.shake()
    inputRef.current?.focus()
  }, [])

  const handleResend = useCallback(() => {
    setResendAt(Date.now() + RESEND_SECONDS * 1000)
    setCode('')
    setError(false)
    inputRef.current?.focus()
  }, [])

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.otpIntro', { code: DEMO_CODE })}
      </MyText>
      <OtpCodeInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        onComplete={handleComplete}
        error={error}
        accessibilityLabel={t('playground.otpLabel')}
      />
      <MyText
        typography="caption"
        color={error ? 'text/alert/primary' : 'text/active/secondary'}
        style={styles.introText}
      >
        {error ? t('playground.otpWrong') : verified ? t('playground.otpVerified') : ' '}
      </MyText>
      <MyButton
        type="secondary"
        disabled={secondsLeft > 0}
        onPress={handleResend}
        text={
          secondsLeft > 0
            ? t('playground.otpResendIn', { time: formatCountdown(secondsLeft) })
            : t('playground.otpResend')
        }
      />
    </MyKeyboardAvoiding.ScrollView>
  )
}
