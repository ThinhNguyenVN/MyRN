import { z } from 'zod'
import { ScrollView, StyleSheet } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import {
  MyForm,
  useFormContext,
  MyFormTextInput,
  MyFormDatePicker,
  MyFormDropdown,
  MyFormCounter,
  MyFormSwitch,
  MyFormWheelPicker,
  MyFormChip,
  MyFormChips,
} from '@/components/form'
import type { WheelPickerItem } from '@/components/elements/my-wheel-picker/type'
const formScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  formTitle: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 8,
  },
})

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
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  birthDate: z.date().nullable(),
  role: z.string().nullable(),
  count: z.number().min(0).max(99),
  enabled: z.boolean(),
  level: z.number().nullable(),
  accepted: z.boolean().refine((v) => v === true, 'Cần đồng ý điều khoản'),
  newsletter: z.boolean(),
  marketing: z.boolean(),
  notifications: z.boolean(),
  tags: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: FormValues = {
  name: '',
  birthDate: null,
  role: null,
  count: 0,
  enabled: false,
  level: null,
  accepted: false,
  newsletter: false,
  marketing: false,
  notifications: false,
  tags: [],
}

function FormContent() {
  const { handleSubmit } = useFormContext<FormValues>()

  const onSubmit = (data: FormValues) => {
    // eslint-disable-next-line no-console
    console.log('Form submitted:', data)
    alert(JSON.stringify(data, null, 2))
  }

  return (
    <ScrollView
      style={formScreenStyles.screen}
      contentContainerStyle={formScreenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <MyText typography="subtitle" style={formScreenStyles.formTitle}>
        Thông tin đăng ký
      </MyText>

      <MyView style={formScreenStyles.field}>
        <MyFormTextInput<FormValues, 'name'>
          name="name"
          placeholder="Nhập họ tên"
          title="Họ tên"
          required
        />
      </MyView>

      <MyView style={formScreenStyles.field}>
        <MyFormDatePicker<FormValues, 'birthDate'>
          name="birthDate"
          placeholder="Chọn ngày sinh"
          title="Ngày sinh"
        />
      </MyView>

      <MyView style={formScreenStyles.field}>
        <MyFormDropdown<FormValues, 'role'>
          name="role"
          options={DROPDOWN_OPTIONS}
          placeholder="Chọn vai trò"
          title="Vai trò"
        />
      </MyView>

      <MyView style={formScreenStyles.field}>
        <MyText typography="label" style={{ marginBottom: 8 }}>
          Số lượng
        </MyText>
        <MyFormCounter<FormValues, 'count'> name="count" min={0} max={99} />
      </MyView>

      <MyView style={formScreenStyles.field}>
        <MyFormSwitch<FormValues, 'enabled'> name="enabled" label="Bật tính năng" />
      </MyView>

      <MyView style={formScreenStyles.field}>
        <MyFormWheelPicker<FormValues, 'level'>
          name="level"
          items={WHEEL_ITEMS}
          title="Cấp độ"
          placeholder="Chọn cấp độ"
        />
      </MyView>

      <MyView style={formScreenStyles.field}>
        <MyText typography="label" style={{ marginBottom: 8 }}>
          Sở thích (chọn nhiều)
        </MyText>
        <MyFormChips<FormValues, 'tags'> name="tags" data={TAG_OPTIONS} multiSelect />
      </MyView>

      <MyView style={formScreenStyles.field}>
        <MyText typography="label" style={{ marginBottom: 8 }}>
          Tùy chọn
        </MyText>
        <MyView style={formScreenStyles.chipWrap}>
          <MyFormChip<FormValues, 'accepted'> name="accepted" label="Đồng ý điều khoản" />
          <MyFormChip<FormValues, 'newsletter'> name="newsletter" label="Tin khuyến mãi" />
          <MyFormChip<FormValues, 'marketing'> name="marketing" label="Quảng cáo" />
          <MyFormChip<FormValues, 'notifications'> name="notifications" label="Thông báo đẩy" />
        </MyView>
      </MyView>

      <MyButton
        type="primary"
        text="Hoàn tất"
        onPress={handleSubmit(onSubmit)}
        style={formScreenStyles.submitBtn}
      />
    </ScrollView>
  )
}

export default function FormPlaygroundScreen() {
  return (
    <MyForm<FormValues> schema={formSchema} defaultValues={defaultValues}>
      <FormContent />
    </MyForm>
  )
}
