import { Image } from 'expo-image'
import { router } from 'expo-router'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import ParallaxScrollView from '@/components/ui/parallax-scroll-view'
import { generateStyles } from './styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function HomeScreen() {
  const styles = useThemedStyles(generateStyles)
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <MyView style={styles.titleContainer}>
        <MyText typography="subtitle" style={styles.sectionTitle}>
          MyRN
        </MyText>
        <MyText typography="body" color="text/active/secondary" style={styles.introText}>
          React Native app với bộ component dùng chung (MyView, MyText, MyButton, MyTextInput,
          MyDropdownInput, MyCheckbox, MyCounter, Toast, Bottom Sheet, Confirmation, Alert, Image…).
          Theme, spacing và elevation thống nhất.
        </MyText>
        <MyButton
          width={'full'}
          text="Xem Component Playground"
          size={'large'}
          type="primary"
          onPress={() => router.push('/(tabs)/playground')}
          style={styles.introButton}
        />
      </MyView>
    </ParallaxScrollView>
  )
}
