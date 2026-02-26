import { useState } from 'react'
import { Image } from 'expo-image'

import ParallaxScrollView from '@/components/ui/parallax-scroll-view'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MySurface from '@/components/elements/my-surface'
import MyView from '@/components/elements/my-view'
import MyTextInput from '@/components/elements/my-text-input'
import MyIcon from '@/components/elements/my-icon'
import { generateStyles } from './styles'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

export default function HomeScreen() {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
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
        <MyText typography={'subtitle'} color={'text/active/tertiary'}>
          Quéo còm !!
        </MyText>

        <MyView
          backgroundColor={'fill/active/primary'}
          margin={getSpacing('x2')}
          padding={getSpacing('x6')}
          radius={'small'}
        >
          <MyText typography="body" color="text/active/primary">
            soft/down/small
          </MyText>
        </MyView>
        <MySurface
          elevation={'soft/up/medium'}
          style={[
            {
              backgroundColor: 'red',
              marginTop: 30,
              width: 200,
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <MyText typography="body" color="text/active/primary">
            soft/down/medium
          </MyText>
        </MySurface>

        <MyText typography="subtitle" style={{ marginTop: 24, marginBottom: 8 }}>
          Buttons
        </MyText>
        <MyButton
          width={'full'}
          text="Button Primary"
          size={'large'}
          type="primary"
          onPress={() => {}}
          left={<MyIcon name={'key'} color="icon/active/tertiary" />}
          right={<MyIcon name="home" color="icon/active/tertiary" />}
          style={{ backgroundColor: 'red' }}
        />
        <MyView style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 18 }}>
          <MyButton
            width={'full'}
            text="Primary"
            size={'small'}
            type="primary"
            loading
            left={<MyIcon name={'home'} color="icon/active/tertiary" />}
            onPress={() => {}}
            style={{ marginBottom: 8 }}
          />
          <MyButton
            width={'full'}
            text="Primary"
            size={'small'}
            type="primary"
            disabled
            onPress={() => {}}
            style={{ marginBottom: 8 }}
          />
        </MyView>

        <MyButton
          text="Secondary"
          width={'auto'}
          size={'small'}
          type="secondary"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
        />
        <MyButton
          width={'auto'}
          text="Tertiary"
          type="tertiary"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
        />
        <MyButton
          width={'auto'}
          text="Light"
          type="light"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
        />
        <MyButton
          width={'auto'}
          text="Dark"
          type="dark"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
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

        <MyText typography="subtitle" style={{ marginTop: 24, marginBottom: 8 }}>
          Text inputs
        </MyText>
        <MyView style={{ marginBottom: 12, alignSelf: 'stretch' }}>
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
        <MyView style={{ marginBottom: 12, alignSelf: 'stretch' }}>
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
        <MyView style={{ marginBottom: 12, alignSelf: 'stretch' }}>
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
        <MyView style={{ marginBottom: 12, alignSelf: 'stretch' }}>
          <MyTextInput
            title="Prefix / suffix"
            startText="https://"
            endText=".com"
            placeholder="domain"
          />
        </MyView>
        <MyView style={{ marginBottom: 12, alignSelf: 'stretch' }}>
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
