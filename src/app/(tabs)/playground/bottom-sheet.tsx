import { useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

const LIST_ITEMS = ['Option A', 'Option B', 'Option C', 'Option D']

export default function BottomSheetScreen() {
  const styles = useThemedStyles(generateStyles)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  const [longName, setLongName] = useState('')
  const [longPhone, setLongPhone] = useState('')
  const [longAddress, setLongAddress] = useState('')
  const [longNote, setLongNote] = useState('')
  const simpleRef = useRef<MyBottomSheetRef>(null)
  const formRef = useRef<MyBottomSheetRef>(null)
  const listRef = useRef<MyBottomSheetRef>(null)
  const longRef = useRef<MyBottomSheetRef>(null)
  const customHeaderRef = useRef<MyBottomSheetRef>(null)
  const noCloseRef = useRef<MyBottomSheetRef>(null)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Bottom Sheet
      </MyText>

      <MyView style={styles.bottomsheet}>
        <MyButton
          width="full"
          text="1. Simple (title + text)"
          size="small"
          type="primary"
          onPress={() => simpleRef.current?.open()}
        />
        <MyButton
          width="full"
          text="2. Form (inputs + footer)"
          size="small"
          type="primary"
          onPress={() => formRef.current?.open()}
        />
        <MyButton
          width="full"
          text="3. List content"
          size="small"
          type="secondary"
          onPress={() => listRef.current?.open()}
        />
        <MyButton
          width="full"
          text="4. Long content (scroll)"
          size="small"
          type="tertiary"
          onPress={() => longRef.current?.open()}
        />
        <MyButton
          width="full"
          text="5. Custom header"
          size="small"
          type="light"
          onPress={() => customHeaderRef.current?.open()}
        />
        <MyButton
          width="full"
          text="6. No close button"
          size="small"
          type="dark"
          onPress={() => noCloseRef.current?.open()}
        />
      </MyView>

      {/* 1. Simple */}
      <MyBottomSheet
        ref={simpleRef}
        title="Simple"
        showClose
        pressBackdropToClose
        contentContainerStyle={styles.sheetContent}
      >
        <MyText typography="body" color="text/active/secondary">
          Nội dung ngắn. Đóng bằng nút X hoặc chạm backdrop.
        </MyText>
      </MyBottomSheet>

      {/* 2. Form */}
      <MyBottomSheet
        ref={formRef}
        title="Form"
        showClose
        onClosed={() => {}}
        contentContainerStyle={styles.sheetContent}
        pressBackdropToClose
        footer={
          <MyButton
            width="full"
            text="Đóng"
            type="primary"
            onPress={() => formRef.current?.close()}
          />
        }
      >
        <View style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title="Email"
            subTitle="Nhập email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
            startIcon={<MyIcon name="mail-outline" size={20} color="icon/active/primary" />}
          />

          <MyTextInput
            useBottomSheetTextInput
            title="Password"
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            required
            startIcon={<MyIcon name="lock-closed-outline" size={20} color="icon/active/primary" />}
          />

          <MyTextInput
            useBottomSheetTextInput
            title="With error"
            error={showError}
            errorMessage={showError ? 'Không được để trống' : undefined}
            value={email}
            onChangeText={(t) => {
              setEmail(t)
              setShowError(false)
            }}
            onEndIconPress={() => setShowError(true)}
            endIcon={<MyIcon name="alert-circle-outline" size={20} color="icon/alert/primary" />}
          />
        </View>
      </MyBottomSheet>

      {/* 3. List */}
      <MyBottomSheet
        ref={listRef}
        title="Chọn option"
        showClose
        pressBackdropToClose
        contentContainerStyle={styles.sheetContent}
        footer={
          <MyButton
            width="full"
            text="Xong"
            type="secondary"
            onPress={() => listRef.current?.close()}
          />
        }
      >
        {LIST_ITEMS.map((item) => (
          <MyView key={item} paddingVertical={12} paddingHorizontal={0}>
            <MyText typography="body">{item}</MyText>
          </MyView>
        ))}
      </MyBottomSheet>

      {/* 4. Long content */}
      <MyBottomSheet
        ref={longRef}
        title="Long content"
        showClose
        pressBackdropToClose
        contentContainerStyle={styles.sheetContent}
      >
        <MyText typography="body" color="text/active/secondary">
          Đoạn văn dài. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </MyText>
        <MyText typography="body" color="text/active/secondary">
          Đoạn văn dài. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </MyText>
        <MyText typography="body" color="text/active/secondary">
          Đoạn văn dài. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </MyText>

        <MyText typography="body" color="text/active/secondary">
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
          anim id est laborum.
        </MyText>
        <MyView style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title="Họ tên"
            placeholder="Nhập họ tên"
            value={longName}
            onChangeText={setLongName}
          />
        </MyView>
        <MyView style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title="Số điện thoại"
            placeholder="Nhập SĐT"
            value={longPhone}
            onChangeText={setLongPhone}
            keyboardType="phone-pad"
          />
        </MyView>
        <MyView style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title="Địa chỉ"
            placeholder="Nhập địa chỉ"
            value={longAddress}
            onChangeText={setLongAddress}
          />
        </MyView>
        <MyView style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title="Ghi chú"
            placeholder="Ghi chú thêm..."
            value={longNote}
            onChangeText={setLongNote}
            multiline
            numberOfLines={3}
            height={80}
          />
        </MyView>
      </MyBottomSheet>

      {/* 5. Custom header */}
      <MyBottomSheet
        ref={customHeaderRef}
        header={
          <MyView
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal={16}
            paddingVertical={12}
          >
            <MyIcon name="information-circle-outline" size={24} color="icon/active/primary" />
            <MyText typography="subtitle">Custom header</MyText>
            <MyButton.Icon
              icon="close"
              type="light"
              onPress={() => customHeaderRef.current?.close()}
            />
          </MyView>
        }
        showClose={false}
        pressBackdropToClose
        contentContainerStyle={styles.sheetContent}
      >
        <MyText typography="body" color="text/active/secondary">
          Header tùy chỉnh, không dùng title mặc định.
        </MyText>
      </MyBottomSheet>

      {/* 6. No close button */}
      <MyBottomSheet
        ref={noCloseRef}
        title="Chỉ đóng bằng footer"
        showClose={false}
        pressBackdropToClose
        contentContainerStyle={styles.sheetContent}
        footer={
          <MyButton
            width="full"
            text="Đóng"
            type="primary"
            onPress={() => noCloseRef.current?.close()}
          />
        }
      >
        <MyText typography="body" color="text/active/secondary">
          Không có nút X. Đóng bằng nút bên dưới hoặc chạm backdrop.
        </MyText>
      </MyBottomSheet>
    </ScrollView>
  )
}
