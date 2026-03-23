import { useMemo, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FormScrollProvider, MyForm } from '@/components/form'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import type { MyKeyboardAvoidingScrollViewRef } from '@/components/ui/my-keyboard-avoiding'
import { useThemedStyles } from '@/theme/theme-context'

import { LoginScreenView } from './login-screen.view'
import { loginDefaultValues, loginSchema, type LoginFormInput } from './login-screen.types'
import { useLogin } from './use-login'
import { generateStyles } from './styles'

function LoginFormBody({ scrollToField }: { scrollToField: (name: string) => void }) {
  const { submitError, isLoading, onSignInPress } = useLogin(scrollToField)
  return (
    <LoginScreenView
      submitError={submitError}
      isLoading={isLoading}
      onSignInPress={onSignInPress}
    />
  )
}

export default function LoginScreenContainer() {
  const styles = useThemedStyles(generateStyles)
  const scrollViewRef = useRef<MyKeyboardAvoidingScrollViewRef>(null)
  const content = useMemo(
    () => (
      <FormScrollProvider scrollViewRef={scrollViewRef} containerStyle={styles.formContainer}>
        {(scrollToField) => <LoginFormBody scrollToField={scrollToField} />}
      </FormScrollProvider>
    ),
    [styles.formContainer],
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <MyForm<LoginFormInput>
        schema={loginSchema}
        defaultValues={loginDefaultValues}
        mode="onSubmit"
        reValidateMode="onChange"
      >
        <MyKeyboardAvoiding.ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showToolbar={true}
        >
          {content}
        </MyKeyboardAvoiding.ScrollView>
      </MyForm>
    </SafeAreaView>
  )
}
