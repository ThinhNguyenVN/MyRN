import { useRef, useState } from 'react'
import { Image } from 'expo-image'

import ParallaxScrollView from '@/components/ui/parallax-scroll-view'
import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import { Confirmation } from '@/components/ui/confirmation'

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
  const bottomSheetRef = useRef<MyBottomSheetRef>(null)

  return (
    <>
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
            />
            <MyButton
              width={'full'}
              text="Primary"
              size={'small'}
              type="primary"
              onPress={() => {}}
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
            Button Icon
          </MyText>
          <MyView flexDirection="row" gap={8}>
            <MyButton.Icon icon="home" type="primary" onPress={() => {}} />
            <MyButton.Icon icon="add" type="secondary" size="small" onPress={() => {}} />
            <MyButton.Icon icon="heart-outline" type="tertiary" onPress={() => {}} />
            <MyButton.Icon icon="settings-outline" type="light" size="small" onPress={() => {}} />
            <MyButton.Icon icon="moon" type="dark" onPress={() => {}} />
            <MyButton.Icon icon="refresh" type="primary" loading onPress={() => {}} />
            <MyButton.Icon icon="trash-outline" type="secondary" disabled onPress={() => {}} />
          </MyView>

          <MyText typography="subtitle" style={styles.sectionTitle}>
            Confirmation
          </MyText>
          <MyButton
            width={'full'}
            text="Confirm (info)"
            size={'small'}
            type="primary"
            onPress={async () => {
              const ok = await Confirmation.confirm({
                // title: 'Xác nhận',
                hideClose: true,
                message: 'Bạn có chắc muốn tiếp tục?',
                type: 'info',
                confirmText: 'Đồng ý',

                // cancelText: 'Hủy',
              })
              console.log('ok ==>', ok)
            }}
            style={styles.buttonMargin}
          />
          <MyButton
            width={'full'}
            text="Confirm (warning)"
            size={'small'}
            type="secondary"
            onPress={async () => {
              const ok = await Confirmation.confirm({
                message: 'Hành động không thể hoàn tác.',
                description: 'Bạn có chắc muốn xóa?',
                type: 'warning',
                confirmText: 'Xóa',
                cancelText: 'Không',
                buttons: [
                  {
                    text: 'Xóa',
                    type: 'tertiary',
                    onPress: () => {
                      console.log('Xóa')
                      Confirmation.hide()
                    },
                  },
                  {
                    text: 'Không',
                    type: 'secondary',
                    onPress: () => {
                      console.log('Không')
                      Confirmation.hide()
                    },
                  },
                ],
              })
              console.log('ok ==>', ok)
            }}
            style={styles.buttonMargin}
          />

          <MyText typography="subtitle" style={styles.sectionTitle}>
            Bottom Sheet
          </MyText>
          <MyButton
            width={'full'}
            text="Open Bottom Sheet"
            size={'small'}
            type="primary"
            onPress={() => bottomSheetRef.current?.open()}
            style={styles.buttonMargin}
          />

          <MyBottomSheet
            ref={bottomSheetRef}
            title="Text Inputs Sample"
            showClose
            onClosed={() => {}}
            contentContainerStyle={{ gap: 8 }}
            pressBackdropToClose
            // footer={
            //   <MyButton
            //     width={'full'}
            //     text="Close"
            //     type="primary"
            //     onPress={() => bottomSheetRef.current?.close()}
            //   />
            // }
            // header={
            //   <MyView backgroundColor={'fill/active/primary'}>
            //     <MyText typography="subtitle">Text Inputs Sample</MyText>
            //   </MyView>
            // }
          >
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
                startIcon={
                  <MyIcon name="lock-closed-outline" size={20} color="icon/active/primary" />
                }
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
                endIcon={
                  <MyIcon name="alert-circle-outline" size={20} color="icon/alert/primary" />
                }
              />
            </MyView>

            <MyTextInput
              title="Prefix / suffix"
              startText="https://"
              endText=".com"
              placeholder="domain"
            />

            <MyTextInput title="Fixed width (200)" placeholder="width={200}" width={200} />

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
            <MyTextInput
              title="Max length"
              placeholder="Tối đa 20 ký tự"
              maxLength={20}
              showCurrentLength
              value="1234567890"
            />
          </MyBottomSheet>
        </MyView>
      </ParallaxScrollView>
    </>
  )
}
