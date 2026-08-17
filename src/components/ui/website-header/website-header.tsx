import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useComingSoon } from '@/hooks/use-coming-soon'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { WebsiteHeaderProps } from './type'

function WebsiteHeaderComponent({
  title,
  showBack = false,
  onBackPress,
  onNotificationsPress,
  onProfilePress,
  right,
}: WebsiteHeaderProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const comingSoon = useComingSoon()

  const handleNotifications = onNotificationsPress ?? comingSoon
  const handleProfile = onProfilePress ?? comingSoon

  const handleBack = useCallback(() => {
    onBackPress?.()
  }, [onBackPress])

  return (
    <MyView style={styles.root} fillParent={false}>
      <MyView style={styles.titleRow}>
        {showBack ? (
          <MyButton.Icon
            icon="arrow-back"
            type="light"
            size="small"
            elevation="none"
            onPress={handleBack}
            accessibilityLabel={t('common.back')}
          />
        ) : null}
        <MyText typography="h3" style={styles.title} numberOfLines={1}>
          {title}
        </MyText>
      </MyView>
      <MyView style={styles.actions}>
        {right}
        <MyButton.Icon
          icon="notifications-outline"
          type="light"
          size="small"
          elevation="none"
          onPress={handleNotifications}
          accessibilityLabel={t('components.websiteHeader.notifications')}
        />
        <MyButton.Icon
          icon="person-circle-outline"
          type="light"
          size="small"
          elevation="none"
          onPress={handleProfile}
          accessibilityLabel={t('components.websiteHeader.profile')}
        />
      </MyView>
    </MyView>
  )
}

export default memo(WebsiteHeaderComponent)
