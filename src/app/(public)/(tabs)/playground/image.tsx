import { ScrollView } from 'react-native'

import MyImage from '@/components/elements/my-image'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function ImageScreen() {
  const styles = useThemedStyles(generateStyles)
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.labelMargin}>
        1. url hợp lệ
      </MyText>
      <MyImage
        url="https://picsum.photos/200/150"
        width={200}
        marginTop={20}
        marginBottom={20}
        alignSelf="center"
      />
      <MyText typography="label" style={styles.labelMargin}>
        2. source local (require)
      </MyText>
      <MyImage source={require('@/assets/images/react-logo.png')} style={styles.smallImageMargin} />
      <MyText typography="label" style={styles.labelMargin}>
        3. Không có url/source (empty)
      </MyText>
      <MyImage style={styles.image200x120} />
      <MyText typography="label" style={styles.labelMargin}>
        4. Empty + showMessage
      </MyText>
      <MyImage showMessage emptyMessage="Chưa có ảnh" style={styles.image200x120} />
      <MyText typography="label" style={styles.labelMargin}>
        5. URL lỗi (error state)
      </MyText>
      <MyImage url="https://invalid-url-will-fail.example/img.jpg" width={100} alignSelf="center" />
      <MyText typography="label" style={styles.labelMargin}>
        6. Error + showMessage
      </MyText>
      <MyImage
        url="https://invalid-url-will-fail.example/img.jpg"
        showMessage
        errorMessage="Tải ảnh thất bại"
        style={styles.image200x120}
      />
      <MyText typography="label" style={styles.labelMargin}>
        7. onPress
      </MyText>
      <MyImage
        url="https://picsum.photos/200/100"
        onPress={() => alert('Image pressed')}
        style={styles.image200x100}
      />
      <MyText typography="label" style={styles.labelMargin}>
        8. elevation
      </MyText>
      <MyImage
        url="https://picsum.photos/180/100"
        elevation="soft/down/small"
        style={styles.image180x100}
      />
      <MyText typography="label" style={styles.labelMargin}>
        9. contentFit: contain
      </MyText>
      <MyImage
        url="https://picsum.photos/200/200"
        contentFit="contain"
        style={styles.image150x150}
      />
      <MyText typography="label" style={styles.labelMargin}>
        10. emptyContent custom
      </MyText>
      <MyImage
        emptyContent={
          <MyView padding={24} alignItems="center" gap={8}>
            <MyIcon name="add-circle-outline" size={40} color="icon/inactive/primary" />
            <MyText typography="caption" color="text/inactive/primary">
              Thêm ảnh
            </MyText>
          </MyView>
        }
        style={styles.image200x100}
      />
      <MyText typography="label" style={styles.labelMargin}>
        11. priority (high) + loading
      </MyText>
      <MyImage url="https://picsum.photos/200/120" priority="high" style={styles.image200x120} />
      <MyText typography="label" style={styles.labelMargin}>
        12. errorContent custom
      </MyText>
      <MyImage
        url="https://invalid-url.example/img.jpg"
        errorContent={
          <MyView style={styles.errorContent}>
            <MyIcon name="refresh-outline" size={28} color="icon/alert/primary" />
            <MyText typography="caption" color="text/alert/primary">
              Lỗi tải ảnh
            </MyText>
          </MyView>
        }
        style={styles.image200x100}
      />
    </ScrollView>
  )
}
