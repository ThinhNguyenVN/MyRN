import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ProfileMenuButton } from '@/components/ui/profile-menu-button'
import { useComingSoon } from '@/hooks/use-coming-soon'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { WebsiteHeaderProps } from './type'

function WebsiteHeader({
  title,
  showBack = false,
  onBackPress,
  onNotificationsPress,
  onProfilePress,
  avatarUri,
  profileMenuItems,
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
    <MyView style={styles.root}>
      <MyView style={styles.titleRow}>
        {showBack ? (
          <MyButton.Icon
            icon="arrow-back"
            type="light"
            size="small"
            elevation="none"
            onPress={handleBack}
            accessibilityLabel={t('shell.back')}
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
          accessibilityLabel={t('dashboard.header.notifications')}
        />
        {profileMenuItems && profileMenuItems.length > 0 ? (
          <ProfileMenuButton
            avatarUri={avatarUri}
            items={profileMenuItems}
            accessibilityLabel={t('dashboard.header.profile')}
          />
        ) : (
          <MyButton.Icon
            icon="person-circle-outline"
            type="light"
            size="small"
            elevation="none"
            onPress={handleProfile}
            accessibilityLabel={t('dashboard.header.profile')}
          />
        )}
      </MyView>
    </MyView>
  )
}

export default memo(WebsiteHeader)
