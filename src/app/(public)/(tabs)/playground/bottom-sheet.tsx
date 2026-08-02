import { useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyCheckbox from '@/components/elements/my-checkbox'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

const LIST_ITEMS = [
  'playground.dropdownOptionA',
  'playground.dropdownOptionB',
  'playground.dropdownOptionC',
  'playground.dropdownOptionD',
]

export default function BottomSheetScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  const [longName, setLongName] = useState('')
  const [longPhone, setLongPhone] = useState('')
  const [longAddress, setLongAddress] = useState('')
  const [longNote, setLongNote] = useState('')
  const [listSelection, setListSelection] = useState<string | null>(null)
  const simpleRef = useRef<MyBottomSheetRef>(null)
  const formRef = useRef<MyBottomSheetRef>(null)
  const listRef = useRef<MyBottomSheetRef>(null)
  const longRef = useRef<MyBottomSheetRef>(null)
  const customHeaderRef = useRef<MyBottomSheetRef>(null)
  const noCloseRef = useRef<MyBottomSheetRef>(null)

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyView style={styles.bottomsheet}>
        <MyButton
          width="full"
          text={t('playground.bottomSheetDemo1')}
          size="small"
          type="primary"
          onPress={() => simpleRef.current?.open()}
        />
        <MyButton
          width="full"
          text={t('playground.bottomSheetDemo2')}
          size="small"
          type="primary"
          onPress={() => formRef.current?.open()}
        />
        <MyButton
          width="full"
          text={t('playground.bottomSheetDemo3')}
          size="small"
          type="secondary"
          onPress={() => listRef.current?.open()}
        />
        <MyButton
          width="full"
          text={t('playground.bottomSheetDemo4')}
          size="small"
          type="tertiary"
          onPress={() => longRef.current?.open()}
        />
        <MyButton
          width="full"
          text={t('playground.bottomSheetDemo5')}
          size="small"
          type="light"
          onPress={() => customHeaderRef.current?.open()}
        />
        <MyButton
          width="full"
          text={t('playground.bottomSheetDemo6')}
          size="small"
          type="dark"
          onPress={() => noCloseRef.current?.open()}
        />
      </MyView>

      {/* 1. Simple */}
      <MyBottomSheet
        ref={simpleRef}
        title={t('playground.bottomSheetSimple')}
        showClose
        pressBackdropToClose
        contentContainerStyle={styles.sheetContent}
      >
        <View style={styles.bottomsheetContent}>
          <MyText typography="body" color="text/active/secondary">
            {t('playground.bottomSheetSimpleDesc')}
          </MyText>
        </View>
      </MyBottomSheet>

      {/* 2. Form */}
      <MyBottomSheet
        ref={formRef}
        title={t('playground.linksForm')}
        showClose
        onClosed={() => {}}
        pressBackdropToClose
        footer={
          <MyButton
            width="full"
            text={t('common.close')}
            type="primary"
            onPress={() => formRef.current?.close()}
          />
        }
      >
        <View style={styles.bottomsheetContent}>
          <MyTextInput
            useBottomSheetTextInput
            title={t('playground.textInputEmail')}
            subTitle={t('playground.textInputEmailSubtitle')}
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
            title={t('playground.textInputPassword')}
            placeholder={t('auth.passwordLabel')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            required
            startIcon={<MyIcon name="lock-closed-outline" size={20} color="icon/active/primary" />}
          />

          <MyTextInput
            useBottomSheetTextInput
            title={t('playground.textInputWithError')}
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
        </View>
      </MyBottomSheet>

      {/* 3. List */}
      <MyBottomSheet
        ref={listRef}
        title={t('components.dropdownSelect')}
        showClose
        pressBackdropToClose
        footer={
          <MyButton
            width="full"
            text={t('common.done')}
            type="secondary"
            onPress={() => listRef.current?.close()}
          />
        }
      >
        {LIST_ITEMS.map((item) => (
          <MyView key={item} paddingVertical={8} paddingHorizontal={0}>
            <MyCheckbox
              type="radio"
              label={t(item)}
              labelStyle={styles.sheetRadioStretch}
              checked={listSelection === item}
              onValueChange={(v) => {
                if (v) setListSelection(item)
              }}
            />
          </MyView>
        ))}
      </MyBottomSheet>

      {/* 4. Long content */}
      <MyBottomSheet
        ref={longRef}
        title={t('playground.bottomSheetLongContent')}
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
            title={t('playground.formName')}
            placeholder={t('playground.formNamePlaceholder')}
            value={longName}
            onChangeText={setLongName}
          />
        </MyView>
        <MyView style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title={t('playground.formPhone')}
            placeholder={t('playground.formPhone')}
            value={longPhone}
            onChangeText={setLongPhone}
            keyboardType="phone-pad"
          />
        </MyView>
        <MyView style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title={t('playground.formAddress')}
            placeholder={t('playground.formAddress')}
            value={longAddress}
            onChangeText={setLongAddress}
          />
        </MyView>
        <MyView style={styles.inputContainer}>
          <MyTextInput
            useBottomSheetTextInput
            title={t('playground.formNote')}
            placeholder={t('playground.bottomSheetMoreNote')}
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
            <MyText typography="subtitle">{t('playground.bottomSheetCustomHeader')}</MyText>
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
          {t('playground.bottomSheetCustomHeaderDesc')}
        </MyText>
      </MyBottomSheet>

      {/* 6. No close button */}
      <MyBottomSheet
        ref={noCloseRef}
        title={t('playground.bottomSheetFooterOnly')}
        showClose={false}
        pressBackdropToClose
        contentContainerStyle={styles.sheetContent}
        footer={
          <MyButton
            width="full"
            text={t('common.close')}
            type="primary"
            onPress={() => noCloseRef.current?.close()}
          />
        }
      >
        <MyView style={styles.bottomsheetContent}>
          <MyText typography="body" color="text/active/secondary">
            {t('playground.bottomSheetNoCloseDesc')}
          </MyText>
        </MyView>
      </MyBottomSheet>
    </ScrollView>
  )
}
