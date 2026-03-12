import { useRef } from 'react'
import { z } from 'zod'
import { ScrollView, View } from 'react-native'

import MyButton from '@/components/elements/my-button'
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
import { useTheme } from '@/theme/theme-context'
import { isNil } from 'lodash'

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
}

function FormBody({ scrollToField }: { scrollToField: (name: string) => void }) {
  const { handleSubmit } = useFormContext<FormValues>()
  const styles = formScreenStyles(useTheme())

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
    <>
      <MyText typography="subtitle" style={styles.formTitle}>
        Thông tin đăng ký
      </MyText>

      <MyFormTextInput<FormValues> name="name" placeholder="Nhập họ tên" title="Họ tên" required />

      <MyFormDatePicker<FormValues> name={'name'} placeholder="Chọn ngày sinh" title="Ngày sinh" />

      <MyFormDropdown<FormValues>
        name="role"
        options={DROPDOWN_OPTIONS}
        placeholder="Chọn vai trò"
        title="Vai trò"
      />

      <MyFormCounter<FormValues> name="count" title="Số lượng" subTitle="1–99" min={1} max={99} />
      <View style={{ height: 400 }} />

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

      <MyButton
        type="primary"
        text="Hoàn tất"
        onPress={handleSubmit(onSubmit, onInvalid)}
        style={styles.submitBtn}
      />
    </>
  )
}

export default function FormPlaygroundScreen() {
  const scrollViewRef = useRef<ScrollView>(null)
  const styles = formScreenStyles(useTheme())

  return (
    <MyForm<FormValues>
      schema={formSchema}
      defaultValues={defaultValues}
      mode={'onBlur'}
      reValidateMode={'onChange'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FormScrollProvider scrollViewRef={scrollViewRef} containerStyle={styles.formContainer}>
          {(scrollToField) => <FormBody scrollToField={scrollToField} />}
        </FormScrollProvider>
      </ScrollView>
    </MyForm>
  )
}
