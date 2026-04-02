import { router } from 'expo-router'
import { useCallback, useMemo, useRef } from 'react'

import { FormScrollProvider, MyForm } from '@/components/form'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import type { MyKeyboardAvoidingScrollViewRef } from '@/components/ui/my-keyboard-avoiding'
import { useThemedStyles } from '@/theme/theme-context'

import { LoginScreenView } from './login-screen.view'
import { loginDefaultValues, loginSchema, type LoginFormInput } from './types'
import { generateStyles } from './styles'

export default function LoginScreenContainer() {
  const styles = useThemedStyles(generateStyles)
  const scrollViewRef = useRef<MyKeyboardAvoidingScrollViewRef>(null)

  const onClosePress = useCallback(() => router.back(), [])

  const content = useMemo(
    () => (
      <FormScrollProvider scrollViewRef={scrollViewRef} containerStyle={styles.formContainer}>
        {(scrollToField) => (
          <LoginScreenView scrollToField={scrollToField} onClosePress={onClosePress} />
        )}
      </FormScrollProvider>
    ),
    [styles.formContainer, onClosePress],
  )

  return (
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
  )
}
