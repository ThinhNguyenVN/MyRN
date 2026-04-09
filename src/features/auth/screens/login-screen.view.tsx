import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyFormTextInput } from '@/components/form'
import { useThemedStyles } from '@/theme/theme-context'
import { useLogin } from './use-login'

import { generateStyles } from './styles'
import type { LoginForm, LoginScreenViewProps } from './types'
import { View } from 'react-native'
import MyIcon from '@/components/elements/my-icon'
import { useState } from 'react'

export function LoginScreenView({ scrollToField }: LoginScreenViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { submitError, isLoading, onSignInPress } = useLogin(scrollToField)

  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.scrollContent}>
      <MyView style={styles.header}>
        <MyText typography="h1" style={styles.title}>
          Sign in
        </MyText>
        <MyText typography="body" color="text/active/secondary">
          DummyJSON demo - e.g. emilys / emilyspass
        </MyText>
      </MyView>

      <MyFormTextInput<LoginForm>
        name="username"
        title="Username"
        forceError={!!submitError}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        style={styles.inputFullWidth}
      />

      <MyFormTextInput<LoginForm>
        name="password"
        title="Password"
        forceError={!!submitError}
        secureTextEntry={!showPassword}
        autoComplete="password"
        onEndIconPress={() => setShowPassword(!showPassword)}
        endIcon={<MyIcon name={showPassword ? 'eye-off' : 'eye'} color="icon/active/primary" />}
        style={styles.inputFullWidth}
      />

      {submitError ? (
        <MyText typography="caption" color="text/alert/primary" style={styles.rootError}>
          {submitError}
        </MyText>
      ) : null}

      <MyButton
        text="Sign in"
        width="full"
        loading={isLoading}
        disabled={isLoading}
        onPress={onSignInPress}
      />
    </View>
  )
}
