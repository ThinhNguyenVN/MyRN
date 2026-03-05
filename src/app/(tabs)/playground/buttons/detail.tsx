import { router } from 'expo-router'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '../styles'

export default function ButtonsDetailScreen() {
  const styles = useThemedStyles(generateStyles)
  return (
    <MyView style={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Buttons Detail (screen con)
      </MyText>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        Đây là màn con trong stack của Buttons. Sidebar vẫn hiển thị vì vẫn nằm trong playground.
      </MyText>
      <MyButton
        width={'full'}
        text="Back to Buttons"
        type="primary"
        onPress={() => router.back()}
      />
    </MyView>
  )
}
