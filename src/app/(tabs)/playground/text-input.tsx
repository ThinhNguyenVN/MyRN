import { useState } from 'react'

import MyIcon from '@/components/elements/my-icon'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'

export default function TextInputScreen() {
  const styles = useThemedStyles(generateStyles)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyView style={styles.inputContainer}>
        <MyTextInput
          placeholder="Placeholder only"
          title="Default"
          value={email}
          onChangeText={setEmail}
        />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput
          title="Email"
          subTitle="Nhập email đăng nhập"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput
          title="Password"
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          required
          startIcon={<MyIcon name="lock-closed-outline" size={20} color="icon/active/primary" />}
          endIcon={<MyIcon name="eye-outline" size={20} color="icon/active/primary" />}
        />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput
          title="With error"
          subTitle="(Demo)"
          placeholder="Nhập gì đó"
          error={showError}
          errorMessage={showError ? 'Trường này không được để trống' : undefined}
          value={email}
          onChangeText={(t) => {
            setEmail(t)
            setShowError(false)
          }}
          onEndIconPress={() => setShowError(true)}
          endIcon={<MyIcon name="alert-circle-outline" size={20} color="icon/alert/primary" />}
        />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput title="URL" startText="https://" endText=".com" placeholder="domain" />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput title="Fixed width (200)" placeholder="width={200}" width={200} />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput
          title="Max length"
          placeholder="Tối đa 20 ký tự"
          maxLength={20}
          showCurrentLength
          value="1234567890"
        />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput
          title="Disabled"
          placeholder="Không chỉnh sửa được"
          disabled
          value="Disabled value"
        />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput
          title="Multiple lines"
          placeholder="Multiple lines"
          multiline
          value={email}
          numberOfLines={4}
          onChangeText={setEmail}
          showCurrentLength
          maxLength={100}
          height={100}
        />
      </MyView>

      <MyView style={styles.inputContainer}>
        <MyTextInput
          title="Read only"
          placeholder="editable={false}"
          editable={false}
          value="Read only value"
        />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
