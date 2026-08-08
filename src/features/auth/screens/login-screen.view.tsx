import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyCheckbox from '@/components/elements/my-checkbox'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyFormTextInput } from '@/components/form'
import { isWeb } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { LoginForm, LoginScreenViewProps } from './types'
import { useLogin } from './use-login'

export function LoginScreenView({ scrollToField }: LoginScreenViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const { control } = useFormContext<LoginForm>()
  const { submitError, isLoading, onSignInPress } = useLogin(scrollToField)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.scrollContent}>
      <MyView style={styles.header}>
        <MyText typography="h1" style={styles.title}>
          {t('auth.signInTitle')}
        </MyText>
        <MyText typography="body" color="text/active/secondary">
          {t('auth.signInHint')}
        </MyText>
      </MyView>

      <MyFormTextInput<LoginForm>
        name="username"
        title={t('auth.usernameLabel')}
        forceError={!!submitError}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        style={styles.inputFullWidth}
      />

      <MyFormTextInput<LoginForm>
        name="password"
        title={t('auth.passwordLabel')}
        forceError={!!submitError}
        secureTextEntry={!showPassword}
        autoComplete="password"
        onEndIconPress={() => setShowPassword(!showPassword)}
        endIcon={<MyIcon name={showPassword ? 'eye-off' : 'eye'} color="icon/active/primary" />}
        style={styles.inputFullWidth}
      />

      {isWeb ? (
        <Controller
          control={control}
          name="remember"
          render={({ field: { value, onChange } }) => (
            <MyCheckbox
              checked={!!value}
              onValueChange={onChange}
              label={t('auth.rememberMe')}
              isLeftLabel={false}
              elevation="none"
              style={styles.rememberRow}
            />
          )}
        />
      ) : null}

      {submitError ? (
        <MyText typography="caption" color="text/alert/primary" style={styles.rootError}>
          {submitError}
        </MyText>
      ) : null}

      <MyButton
        text={t('auth.signInButton')}
        width="full"
        loading={isLoading}
        disabled={isLoading}
        onPress={onSignInPress}
      />
    </View>
  )
}
