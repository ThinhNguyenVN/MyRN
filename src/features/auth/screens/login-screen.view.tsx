import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyFormTextInput } from '@/components/form'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { LoginForm } from './login-screen.types'
import { View } from 'react-native'

export type LoginScreenViewProps = {
  submitError: string | null
  isLoading: boolean
  onSignInPress: () => void
}

export function LoginScreenView({ submitError, isLoading, onSignInPress }: LoginScreenViewProps) {
  const styles = useThemedStyles(generateStyles)

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
        secureTextEntry
        autoComplete="password"
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
