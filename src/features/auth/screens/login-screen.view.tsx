import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyFormTextInput } from '@/components/form'
import { useThemedStyles } from '@/theme/theme-context'
import { useLogin } from './use-login'

import { generateStyles } from './styles'
import type { LoginForm, LoginScreenViewProps } from './types'
import { View } from 'react-native'

export function LoginScreenView({ scrollToField, onClosePress }: LoginScreenViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { submitError, isLoading, onSignInPress } = useLogin(scrollToField)

  return (
    <View style={styles.scrollContent}>
      <MyView style={styles.closeWrap}>
        <MyButton.Icon icon="close" type="light" size="small" onPress={onClosePress} />
      </MyView>
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
