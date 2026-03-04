import { ScrollView, View } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { Confirmation } from '@/components/ui/confirmation'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function ToastAndConfirmationScreen() {
  const styles = useThemedStyles(generateStyles)
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Toast
      </MyText>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <MyButton
          text="Info"
          size="small"
          type="primary"
          onPress={() => Toast.show({ text: 'Thông tin', type: 'info' })}
        />
        <MyButton
          text="Success"
          size="small"
          type="secondary"
          onPress={() => Toast.show({ text: 'Đã lưu thành công', type: 'success' })}
        />
        <MyButton
          text="Warning"
          size="small"
          type="tertiary"
          onPress={() =>
            Toast.show({ text: 'Cảnh báo', description: 'Vui lòng kiểm tra lại.', type: 'warning' })
          }
        />
        <MyButton
          text="Error"
          size="small"
          type="primary"
          onPress={() =>
            Toast.show({ text: 'Có lỗi xảy ra', description: 'Thử lại sau.', type: 'error' })
          }
        />
        <MyButton
          text="Error + elevation"
          size="small"
          type="secondary"
          onPress={() => Toast.show({ text: 'Lỗi', type: 'error', elevation: 'soft/down/small' })}
        />
        <MyButton
          text="Info (no desc)"
          size="small"
          type="light"
          onPress={() => Toast.show({ text: 'Chỉ có text', type: 'info' })}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Confirmation
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyButton
          width="full"
          text="Confirm (info, hideClose)"
          size="small"
          type="primary"
          onPress={async () => {
            const ok = await Confirmation.confirm({
              hideClose: true,
              message: 'Bạn có chắc muốn tiếp tục?',
              type: 'info',
              confirmText: 'Đồng ý',
            })
            console.log('ok ==>', ok)
          }}
          style={styles.buttonMargin}
        />
        <MyButton
          width="full"
          text="Confirm (warning, 2 buttons)"
          size="small"
          type="secondary"
          onPress={async () => {
            const ok = await Confirmation.confirm({
              message: 'Hành động không thể hoàn tác.',
              description: 'Bạn có chắc muốn xóa?',
              type: 'warning',
              confirmText: 'Xóa',
              cancelText: 'Không',
            })
            console.log('ok ==>', ok)
          }}
          style={styles.buttonMargin}
        />
        <MyButton
          width="full"
          text="Confirm (info, with close)"
          size="small"
          type="tertiary"
          onPress={async () => {
            const ok = await Confirmation.confirm({
              message: 'Xác nhận thao tác?',
              type: 'info',
              confirmText: 'OK',
              cancelText: 'Hủy',
            })
            console.log('ok ==>', ok)
          }}
          style={styles.buttonMargin}
        />
      </MyView>
    </ScrollView>
  )
}
