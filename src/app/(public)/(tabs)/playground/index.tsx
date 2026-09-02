import { Href, router } from 'expo-router'
import { memo, useCallback } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { PLAYGROUND_LINKS } from '@/features/playground/constants'
import { generateStyles } from '@/features/home/styles'

interface PlaygroundLinkItem {
  labelKey: string
  href: string
}

interface PlaygroundLinkRowProps {
  readonly item: PlaygroundLinkItem
  readonly label: string
  readonly styles: ReturnType<typeof generateStyles>
}

function PlaygroundLinkRowInner({ item, label, styles }: PlaygroundLinkRowProps) {
  const handlePress = useCallback(() => router.push(item.href as Href), [item.href])

  return (
    <MyPressable onPress={handlePress} style={styles.linkRow}>
      <MyText typography="body">{label}</MyText>
    </MyPressable>
  )
}

const PlaygroundLinkRow = memo(PlaygroundLinkRowInner)

export default function PlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  return (
    <ScrollView>
      <MyView style={styles.playgroundHeader}>
        <MyIcon
          name="code-slash"
          size={80}
          color="icon/inactive/primary"
          style={styles.playgroundHeaderImage}
        />
      </MyView>
      <MyView style={styles.playgroundContent}>
        <MyText typography={'h3'} style={styles.playgroundTitle}>
          {t('playground.title')}
        </MyText>

        <MyView style={styles.linkListContent}>
          {PLAYGROUND_LINKS.map((item) => (
            <PlaygroundLinkRow
              key={`${item.href}-${item.labelKey}`}
              item={item}
              label={t(item.labelKey)}
              styles={styles}
            />
          ))}
        </MyView>
      </MyView>
    </ScrollView>
  )
}
