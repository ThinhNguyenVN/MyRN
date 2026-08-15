import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MediaListRow } from '@/components/ui/media-list-row'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function MediaListRowScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handlePress = useCallback(() => {
    Toast.show({ text: t('playground.mediaListRowTitle'), type: 'info' })
  }, [t])

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.mediaListRowIntro')}
      </MyText>
      <MyView style={styles.content}>
        <MediaListRow
          title={t('playground.mediaListRowTitle')}
          subtitle={t('playground.mediaListRowMeta')}
          imageUrl="https://picsum.photos/120/120"
          onPress={handlePress}
          trailing={<MyIcon name="chevron-forward" size={18} color="icon/inactive/primary" />}
        />
        <MediaListRow
          title={t('playground.mediaListRowTitle')}
          subtitle={t('playground.mediaListRowMeta')}
          placeholderIcon="cube-outline"
          onPress={handlePress}
        />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
