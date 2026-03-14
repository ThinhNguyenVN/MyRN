import { useMemo, useRef } from 'react'
import { z } from 'zod'

import MyButton from '@/components/elements/my-button'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import type { MyKeyboardAvoidingScrollViewRef } from '@/components/ui/my-keyboard-avoiding'
import MyText from '@/components/elements/my-text'
import {
  MyForm,
  useFormContext,
  FormScrollProvider,
  MyFormTextInput,
  MyFormDatePicker,
  MyFormDropdown,
  MyFormCounter,
  MyFormSwitch,
  MyFormWheelPicker,
  MyFormChips,
} from '@/components/form'
import type { WheelPickerItem } from '@/components/elements/my-wheel-picker/type'
import { formScreenStyles } from './styles'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { isNil } from 'lodash'
import { View } from 'react-native'

const DROPDOWN_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]

const WHEEL_ITEMS: WheelPickerItem[] = [
  { label: 'Cấp 1', value: 1 },
  { label: 'Cấp 2', value: 2 },
  { label: 'Cấp 3', value: 3 },
  { label: 'Cấp 4', value: 4 },
  { label: 'Cấp 5', value: 5 },
]

const TAG_OPTIONS = ['React', 'React Native', 'TypeScript', 'Expo', 'Zod']

const formSchema = z.object({
  name: z.string().nonempty('Vui lòng nhập họ tên'),
  birthDate: z
    .date()
    .nullable()
    .refine((v) => v !== null, 'Vui lòng chọn ngày sinh'),
  role: z
    .string()
    .nullable()
    .refine((v) => !isNil(v) && v !== '', 'Vui lòng chọn vai trò'),
  count: z.number().min(3, 'Số lượng tối thiểu là 3').max(99, 'Số lượng tối đa là 99'),
  enabled: z.boolean().refine((v) => v === true, 'Cần bật tính năng'),
  level: z
    .number()
    .nullable()
    .refine((v) => !isNil(v), 'Vui lòng chọn cấp độ'),

  newsletter: z.boolean(),
  marketing: z.boolean(),
  notifications: z.boolean(),
  tags: z.array(z.string()).min(1, 'Chọn ít nhất một sở thích'),
  note: z.string(),
  address: z.string().min(10, 'Vui lòng nhập địa chỉ'),
  phone: z.string().regex(/^\d+$/, 'Chỉ được nhập số').min(10, 'Vui lòng nhập số điện thoại'),
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
        Thông tin đăng ký
      </MyText>

      <MyFormTextInput<FormValues> name="name" placeholder="Nhập họ tên" title="Họ tên" required />

      <MyFormDatePicker<FormValues>
        name="birthDate"
        placeholder="Chọn ngày sinh"
        title="Ngày sinh"
      />

      <MyFormDropdown<FormValues>
        name="role"
        options={DROPDOWN_OPTIONS}
        placeholder="Chọn vai trò"
        title="Vai trò"
      />

      <MyFormCounter<FormValues> name="count" title="Số lượng" subTitle="1–99" min={1} max={99} />

      <MyFormSwitch<FormValues> name="enabled" title="Tính năng" subTitle="Bật/tắt" />

      <MyFormWheelPicker<FormValues>
        name="level"
        items={WHEEL_ITEMS}
        title="Cấp độ"
        subTitle="Chọn một cấp"
        placeholder="Chọn cấp độ"
      />

      <MyFormChips<FormValues>
        name="tags"
        title="Sở thích"
        subTitle="Chọn nhiều"
        data={TAG_OPTIONS}
        multiSelect
      />

      <MyText typography="label" style={styles.formTitle}>
        Thông tin thêm (keyboard avoiding)
      </MyText>
      <MyFormTextInput<FormValues>
        name="note"
        placeholder="Ghi chú"
        title="Ghi chú"
        multiline
        size={'large'}
        height={100}
      />
      <MyFormTextInput<FormValues> name="address" placeholder="Địa chỉ" title="Địa chỉ" />
      <MyFormTextInput<FormValues>
        name="phone"
        placeholder="Số điện thoại"
        title="SĐT"
        keyboardType="phone-pad"
      />

      <MyButton
        type="primary"
        text="Hoàn tất"
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
