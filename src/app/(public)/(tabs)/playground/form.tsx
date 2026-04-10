import { useMemo, useRef } from 'react'
import { View } from 'react-native'
import { z } from 'zod'
import { isNil } from 'lodash'
import { useTranslation } from 'react-i18next'

import {
  MyForm,
  MyFormChips,
  MyFormCounter,
  MyFormDatePicker,
  MyFormDropdown,
  MyFormSwitch,
  MyFormTextInput,
  MyFormWheelPicker,
  FormScrollProvider,
  useFormContext,
} from '@/components/form'
import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import type { WheelPickerItem } from '@/components/elements/my-wheel-picker/type'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import type { MyKeyboardAvoidingScrollViewRef } from '@/components/ui/my-keyboard-avoiding'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { formScreenStyles } from './styles'

const DROPDOWN_OPTIONS = [
  { label: 'playground.formRoleAdmin', value: 'admin' },
  { label: 'playground.formRoleEditor', value: 'editor' },
  { label: 'playground.formRoleViewer', value: 'viewer' },
]

const WHEEL_ITEMS: WheelPickerItem[] = [
  { label: 'playground.formLevel1', value: 1 },
  { label: 'playground.formLevel2', value: 2 },
  { label: 'playground.formLevel3', value: 3 },
  { label: 'playground.formLevel4', value: 4 },
  { label: 'playground.formLevel5', value: 5 },
]

const TAG_OPTIONS = ['React', 'React Native', 'TypeScript', 'Expo', 'Zod']

const formSchema = z.object({
  name: z.string().nonempty('playground.formErrName'),
  birthDate: z
    .date()
    .nullable()
    .refine((v) => v !== null, 'playground.formErrBirthDate'),
  role: z
    .string()
    .nullable()
    .refine((v) => !isNil(v) && v !== '', 'playground.formErrRole'),
  count: z.number().min(3, 'playground.formErrCountMin').max(99, 'playground.formErrCountMax'),
  enabled: z.boolean().refine((v) => v === true, 'playground.formErrEnable'),
  level: z
    .number()
    .nullable()
    .refine((v) => !isNil(v), 'playground.formErrLevel'),

  newsletter: z.boolean(),
  marketing: z.boolean(),
  notifications: z.boolean(),
  tags: z.array(z.string()).min(1, 'playground.formErrTags'),
  note: z.string(),
  address: z.string().min(10, 'playground.formErrAddress'),
  phone: z
    .string()
    .regex(/^\d+$/, 'playground.formErrPhoneNumberOnly')
    .min(10, 'playground.formErrPhone'),
})

type FormValues = z.input<typeof formSchema>

const defaultValues: FormValues = {
  name: '',
  birthDate: null,
  role: null,
  count: 1,
  enabled: false,
  level: null,
  newsletter: false,
  marketing: false,
  notifications: false,
  tags: [],
  note: '',
  address: '',
  phone: '',
}

function FormBody({ scrollToField }: { scrollToField: (name: string) => void }) {
  const { handleSubmit } = useFormContext<FormValues>()
  const styles = useThemedStyles(formScreenStyles)
  const { t } = useTranslation()
  const roleOptions = DROPDOWN_OPTIONS.map((opt) => ({ ...opt, label: t(opt.label) }))
  const levelItems = WHEEL_ITEMS.map((item) => ({ ...item, label: t(item.label) }))

  const onSubmit = (data: FormValues) => {
    // eslint-disable-next-line no-console
    console.log('Form submitted:', data)
    alert(JSON.stringify(data, null, 2))
  }

  const onInvalid = (errors: Partial<Record<keyof FormValues, { message?: string }>>) => {
    const first = Object.keys(errors)[0] as keyof FormValues | undefined
    if (first) scrollToField(first)
  }

  return (
    <View style={styles.formContent}>
      <MyText typography="subtitle" style={styles.formTitle}>
        {t('playground.formTitle')}
      </MyText>

      <MyFormTextInput<FormValues>
        name="name"
        placeholder={t('playground.formNamePlaceholder')}
        title={t('playground.formName')}
        required
      />

      <MyFormDatePicker<FormValues>
        name="birthDate"
        placeholder={t('playground.formBirthDatePlaceholder')}
        title={t('playground.formBirthDate')}
      />

      <MyFormDropdown<FormValues>
        name="role"
        options={roleOptions}
        placeholder={t('playground.formRolePlaceholder')}
        title={t('playground.formRole')}
      />

      <MyFormCounter<FormValues>
        name="count"
        title={t('playground.formCount')}
        subTitle={t('playground.formCountRange')}
        min={1}
        max={99}
      />

      <MyFormSwitch<FormValues>
        name="enabled"
        title={t('playground.formFeature')}
        subTitle={t('playground.formOnOff')}
      />

      <MyFormWheelPicker<FormValues>
        name="level"
        items={levelItems}
        title={t('playground.formLevel')}
        subTitle={t('playground.formPickOne')}
        placeholder={t('playground.formLevelPlaceholder')}
      />

      <MyFormChips<FormValues>
        name="tags"
        title={t('playground.formTags')}
        subTitle={t('playground.formPickMany')}
        data={TAG_OPTIONS}
        multiSelect
      />

      <MyText typography="label" style={styles.formTitle}>
        {t('playground.formMoreInfo')}
      </MyText>
      <MyFormTextInput<FormValues>
        name="note"
        placeholder={t('playground.formNote')}
        title={t('playground.formNote')}
        multiline
        size={'large'}
        height={100}
      />
      <MyFormTextInput<FormValues>
        name="address"
        placeholder={t('playground.formAddress')}
        title={t('playground.formAddress')}
      />
      <MyFormTextInput<FormValues>
        name="phone"
        placeholder={t('playground.formPhone')}
        title={t('playground.formPhoneShort')}
        keyboardType="phone-pad"
      />

      <MyButton
        type="primary"
        text={t('playground.formComplete')}
        width="full"
        onPress={handleSubmit(onSubmit, onInvalid)}
        style={styles.submitBtn}
      />
    </View>
  )
}

const scrollViewStyle = { flex: 1 }

export default function FormPlaygroundScreen() {
  const scrollViewRef = useRef<MyKeyboardAvoidingScrollViewRef>(null)
  const styles = formScreenStyles(useTheme())

  const content = useMemo(() => {
    return (
      <FormScrollProvider scrollViewRef={scrollViewRef} containerStyle={styles.formContainer}>
        {(scrollToField) => <FormBody scrollToField={scrollToField} />}
      </FormScrollProvider>
    )
  }, [scrollViewRef, styles.formContainer])

  return (
    <MyForm<FormValues>
      schema={formSchema}
      defaultValues={defaultValues}
      mode={'onBlur'}
      reValidateMode={'onChange'}
    >
      <MyKeyboardAvoiding.ScrollView
        ref={scrollViewRef}
        style={[styles.screen, scrollViewStyle]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showToolbar={true}
      >
        {content}
      </MyKeyboardAvoiding.ScrollView>
    </MyForm>
  )
}
