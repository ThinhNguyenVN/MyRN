import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'

import MyImage from '@/components/elements/my-image'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ExternalLink } from '@/components/ui/external-link'
import ParallaxScrollView from '@/components/ui/parallax-scroll-view'
import { Collapsible } from '@/components/ui/collapsible'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Fonts } from '@/constants/theme'

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <MyView style={styles.titleContainer}>
        <MyText typography={'caption'} style={styles.captionRounded}>
          Explore
        </MyText>
      </MyView>
      <MyText>This app includes example code to help you get started.</MyText>
      <Collapsible title="File-based routing">
        <MyText>
          This app has two screens: <MyText typography={'body'}>app/(tabs)/index.tsx</MyText> and{' '}
          <MyText typography={'label'}>app/(tabs)/explore.tsx</MyText>
        </MyText>
        <MyText>
          The layout file in <MyText typography={'label'}>app/(tabs)/_layout.tsx</MyText> sets up
          the tab navigator.
        </MyText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <MyText typography={'caption'}>Learn more</MyText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <MyText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <MyText typography={'label'}>w</MyText> in the terminal running this project.
        </MyText>
      </Collapsible>
      <Collapsible title="Images">
        <MyText>
          For static images, you can use the <MyText typography={'label'}>@2x</MyText> and{' '}
          <MyText typography={'label'}>@3x</MyText> suffixes to provide files for different screen
          densities
        </MyText>
        <Image source={require('@/assets/images/react-logo.png')} style={styles.smallImage} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <MyText typography={'caption'}>Learn more</MyText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="MyImage">
        <MyText typography="caption" color="text/active/tertiary" style={styles.sectionCaption}>
          Các trường hợp sử dụng MyImage
        </MyText>

        <MyText typography="label" style={styles.labelMargin}>
          1. url hợp lệ
        </MyText>
        <MyImage url="https://picsum.photos/200/150" style={styles.image200x150} />

        <MyText typography="label" style={styles.labelMargin}>
          2. source local (require)
        </MyText>
        <MyImage
          source={require('@/assets/images/react-logo.png')}
          style={styles.smallImageMargin}
        />

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
        <MyImage url="https://invalid-url-will-fail.example/img.jpg" style={styles.image200x120} />

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
      </Collapsible>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  captionRounded: {
    fontFamily: Fonts.rounded,
  },
  sectionCaption: {
    marginBottom: 12,
  },
  labelMargin: {
    marginBottom: 8,
  },
  smallImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  smallImageMargin: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  image200x150: {
    width: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
  image200x120: {
    width: 200,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  image200x100: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  image180x100: {
    width: 180,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  image150x150: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 16,
  },
  errorContent: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
})
