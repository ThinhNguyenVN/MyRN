import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'

import { ExternalLink } from '@/components/ui/external-link'
import ParallaxScrollView from '@/components/ui/parallax-scroll-view'

import { Collapsible } from '@/components/ui/collapsible'
import { IconSymbol } from '@/components/ui/icon-symbol'

import { Fonts } from '@/constants/theme'
import MyView from '@/components/elements/my-view'
import MyText from '@/components/elements/my-text'

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
        <MyText
          typography={'caption'}
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
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
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <MyText typography={'caption'}>Learn more</MyText>
        </ExternalLink>
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
})
