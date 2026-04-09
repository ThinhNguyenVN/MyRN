import { router } from 'expo-router'
import { useCallback, useMemo, useRef } from 'react'

import { FormScrollProvider, MyForm } from '@/components/form'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import type { MyKeyboardAvoidingScrollViewRef } from '@/components/ui/my-keyboard-avoiding'
import { useThemedStyles } from '@/theme/theme-context'

import { LoginScreenView } from './login-screen.view'
import { loginDefaultValues, loginSchema, type LoginFormInput } from './types'
import { generateStyles } from './styles'
import MyView from '@/components/elements/my-view'
import MyButton from '@/components/elements/my-button'

export default function LoginScreenContainer() {
  const styles = useThemedStyles(generateStyles)
  const scrollViewRef = useRef<MyKeyboardAvoidingScrollViewRef>(null)

  const onClosePress = useCallback(() => router.back(), [])

  const content = useMemo(
    () => (
      <FormScrollProvider scrollViewRef={scrollViewRef}>
        {(scrollToField) => <LoginScreenView scrollToField={scrollToField} />}
      </FormScrollProvider>
    ),
    [],
  )

  return (
    <MyForm<LoginFormInput>
      schema={loginSchema}
      defaultValues={loginDefaultValues}
      mode="onSubmit"
      reValidateMode="onChange"
    >
      <MyView style={styles.closeWrap}>
        <MyButton.Icon icon="close" type="light" size="small" onPress={onClosePress} />
      </MyView>
      <MyKeyboardAvoiding.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showToolbar={true}
      >
        {content}
      </MyKeyboardAvoiding.ScrollView>
    </MyForm>
  )
}
