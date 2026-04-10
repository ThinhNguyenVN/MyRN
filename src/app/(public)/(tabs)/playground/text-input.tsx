import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyIcon from '@/components/elements/my-icon'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function TextInputScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyView style={styles.inputContainer}>
        <MyTextInput
          placeholder={t('playground.textInputPlaceholderOnly')}
          title={t('playground.textInputDefault')}
          value={email}
          onChangeText={setEmail}
        />
        <MyTextInput
          title={t('playground.textInputEmail')}
          subTitle={t('playground.textInputEmailSubtitle')}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />
        <MyTextInput
          title={t('playground.textInputPassword')}
          placeholder={t('auth.passwordLabel')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          required
          startIcon={<MyIcon name="lock-closed-outline" size={20} color="icon/active/primary" />}
          endIcon={<MyIcon name="eye-outline" size={20} color="icon/active/primary" />}
        />
        <MyTextInput
          title={t('playground.textInputWithError')}
          subTitle="(Demo)"
          placeholder={t('playground.textInputEnterSomething')}
          error={showError}
          errorMessage={showError ? t('playground.textInputRequiredError') : undefined}
          value={email}
          onChangeText={(t) => {
            setEmail(t)
            setShowError(false)
          }}
          onEndIconPress={() => setShowError(true)}
          endIcon={<MyIcon name="alert-circle-outline" size={20} color="icon/alert/primary" />}
        />
        <MyTextInput
          title="URL"
          startText="https://"
          endText=".com"
          placeholder={t('playground.textInputDomain')}
        />
        <MyTextInput
          title={t('playground.textInputFixedWidth')}
          placeholder="width={200}"
          width={200}
        />
        <MyTextInput
          title={t('playground.textInputMaxLength')}
          placeholder={t('playground.textInputMax20')}
          maxLength={20}
          showCurrentLength
          value="1234567890"
        />
        <MyTextInput
          title={t('common.disabled')}
          placeholder={t('playground.textInputNotEditable')}
          disabled
          value={t('playground.textInputDisabledValue')}
        />
        <MyTextInput
          title={t('playground.textInputMultipleLines')}
          placeholder={t('playground.textInputMultipleLines')}
          multiline
          value={email}
          numberOfLines={4}
          onChangeText={setEmail}
          showCurrentLength
          maxLength={100}
          height={100}
        />
        <MyTextInput
          title={t('playground.textInputReadOnly')}
          placeholder="editable={false}"
          editable={false}
          value={t('playground.textInputReadOnlyValue')}
        />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
