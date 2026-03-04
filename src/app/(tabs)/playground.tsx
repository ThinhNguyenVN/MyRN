import { router } from 'expo-router'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import ParallaxScrollView from '@/components/ui/parallax-scroll-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

const PLAYGROUND_LINKS: { label: string; href: string }[] = [
  { label: 'Buttons', href: '/playground/buttons' },
  { label: 'Checkbox', href: '/playground/checkbox' },
  { label: 'Dropdown', href: '/playground/dropdown' },
  { label: 'Counter', href: '/playground/counter' },
  { label: 'Toast & Confirmation', href: '/playground/toast' },
  { label: 'Bottom Sheet', href: '/playground/bottom-sheet' },
  { label: 'Text Input', href: '/playground/text-input' },
  { label: 'Alert', href: '/playground/alert' },
  { label: 'Image', href: '/playground/image' },
]

export default function PlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          name="chevron.left.forwardslash.chevron.right"
          size={120}
          color="#808080"
          style={styles.playgroundHeaderImage}
        />
      }
    >
      <MyView style={styles.playgroundContent}>
        <MyText typography="subtitle" style={styles.playgroundTitle}>
          Component Playground
        </MyText>
        <MyText typography="body" color="text/active/tertiary" style={styles.playgroundSubtitle}>
          Chọn component để xem showcase
        </MyText>
        <MyView style={styles.linkListContent}>
          {PLAYGROUND_LINKS.map((item) => (
            <MyPressable
              key={`${item.href}-${item.label}`}
              onPress={() => router.push(item.href as any)}
              style={styles.linkRow}
            >
              <MyView style={styles.linkRowLabel}>
                <MyText typography="body">{item.label}</MyText>
              </MyView>
              <MyText
                typography="caption"
                color="text/inactive/primary"
                style={styles.linkRowArrow}
              >
                →
              </MyText>
            </MyPressable>
          ))}
        </MyView>
      </MyView>
    </ParallaxScrollView>
  )
}
