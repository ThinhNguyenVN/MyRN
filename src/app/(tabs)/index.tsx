import { useState } from 'react'
import { Image } from 'expo-image'

import ParallaxScrollView from '@/components/ui/parallax-scroll-view'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import MyTextInput from '@/components/elements/my-text-input'
import MyIcon from '@/components/elements/my-icon'
import { generateStyles } from './styles'
import { useThemedStyles } from '@/theme/theme-context'
import { router } from 'expo-router'

export default function HomeScreen() {
  const styles = useThemedStyles(generateStyles)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <MyView style={styles.titleContainer}>
        <MyText typography="subtitle" style={styles.sectionTitle}>
          Buttons
        </MyText>
        <MyButton
          width={'full'}
          text="Go to Home"
          size={'large'}
          type="primary"
          onPress={() => {
            router.navigate('/home')
          }}
          left={<MyIcon name={'key'} color="icon/active/tertiary" />}
          right={<MyIcon name="home" color="icon/active/tertiary" />}
          style={styles.redButton}
        />
        <MyView style={styles.buttonRow}>
          <MyButton
            width={'full'}
            text="Primary"
            size={'small'}
            type="primary"
            loading
            left={<MyIcon name={'home'} color="icon/active/tertiary" />}
            onPress={() => {}}
            style={styles.buttonMargin}
          />
          <MyButton
            width={'full'}
            text="Primary"
            size={'small'}
            type="primary"
            disabled
            onPress={() => {}}
            style={styles.buttonMargin}
          />
        </MyView>

        <MyButton
          text="Secondary"
          width={'auto'}
          size={'small'}
          type="secondary"
          onPress={() => {}}
          style={styles.buttonMargin}
        />
        <MyButton
          width={'auto'}
          text="Tertiary"
          type="tertiary"
          onPress={() => {}}
          style={styles.buttonMargin}
        />
        <MyButton
          width={'auto'}
          text="Light"
          type="light"
          onPress={() => {}}
          style={styles.buttonMargin}
        />
        <MyButton
          width={'auto'}
          text="Dark"
          type="dark"
          onPress={() => {}}
          style={styles.buttonMargin}
        />
        <MyButton
          text="Small"
          type="primary"
          size="small"
          onPress={() => {}}
          left={<MyIcon name={'key'} color="icon/active/tertiary" />}
        />
        <MyButton text="Loading" type="secondary" loading onPress={() => {}} />
        <MyButton text="Disabled" type="primary" onPress={() => {}} disabled />

        <MyText typography="subtitle" style={styles.sectionTitle}>
          Text inputs
        </MyText>
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
            startIcon={<MyIcon name="mail-outline" size={20} color="icon/active/primary" />}
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
            subTitle="(Demo trạng thái lỗi)"
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
          <MyTextInput
            title="Prefix / suffix"
            startText="https://"
            endText=".com"
            placeholder="domain"
          />
        </MyView>
        <MyView style={styles.inputContainer}>
          <MyTextInput title="Fixed width (200)" placeholder="width={200}" width={200} />
        </MyView>

        <MyTextInput
          title="Max length"
          placeholder="Tối đa 20 ký tự"
          maxLength={20}
          showCurrentLength
          value="1234567890"
        />

        <MyTextInput
          title="Disabled"
          placeholder="Không chỉnh sửa được"
          disabled
          value="Disabled value"
        />

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
    </ParallaxScrollView>
  )
}
