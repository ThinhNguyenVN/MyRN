import { ScrollView } from 'react-native'

import MyAlert from '@/components/elements/my-alert'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function AlertScreen() {
  const styles = useThemedStyles(generateStyles)
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.labelMargin}>
        1. Info
      </MyText>
      <MyAlert
        type="info"
        title="Thông tin"
        message="Đây là thông báo thông tin"
        description="Mô tả chi tiết của alert loại info."
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        2. Success
      </MyText>
      <MyAlert
        type="success"
        title="Thành công"
        message="Thao tác đã hoàn tất"
        description="Dữ liệu đã được lưu thành công."
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        3. Warning
      </MyText>
      <MyAlert
        type="warning"
        title="Cảnh báo"
        message="Vui lòng kiểm tra lại"
        description="Có một số thông tin cần được xác nhận."
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        4. Error
      </MyText>
      <MyAlert
        type="error"
        title="Lỗi"
        message="Đã xảy ra lỗi"
        description="Không thể thực hiện thao tác. Vui lòng thử lại sau."
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        5. Custom icon
      </MyText>
      <MyAlert
        type="info"
        icon="notifications"
        message="Thông báo mới"
        description="Bạn có 3 thông báo chưa đọc."
        style={styles.alertMargin}
        onClose={() => {}}
      />
      <MyText typography="label" style={styles.labelMargin}>
        6. With image
      </MyText>
      <MyAlert
        type="success"
        image={require('@/assets/images/react-logo.png')}
        message="Cập nhật profile"
        description="Ảnh đại diện đã được cập nhật."
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        7. Minimal (no header)
      </MyText>
      <MyAlert type="warning" message="Phiên đăng nhập sắp hết hạn" style={styles.alertMargin} />
      <MyText typography="label" style={styles.labelMargin}>
        8. With elevation
      </MyText>
      <MyAlert
        type="success"
        title="Thành công"
        message="Có shadow"
        elevation="soft/down/small"
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        9. With buttons
      </MyText>
      <MyAlert
        type="info"
        title="Xác nhận"
        message="Bạn có muốn tiếp tục?"
        description="Thao tác này không thể hoàn tác."
        onClose={() => {}}
        buttons={[
          { text: 'Hủy', type: 'tertiary', onPress: () => {} },
          { text: 'Xác nhận', type: 'primary', onPress: () => {} },
        ]}
        style={styles.alertMargin}
      />
    </ScrollView>
  )
}
