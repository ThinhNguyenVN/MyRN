import { useCallback, useMemo } from 'react'
import { Alert, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { ProfileMenuButton } from '@/components/ui/profile-menu-button'
import { generateStyles } from '@/features/playground/styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function ProfileMenuButtonScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleEditProfile = useCallback(() => {
    Alert.alert(t('playground.profileMenuButtonEditProfile'))
  }, [t])

  const handleChangePassword = useCallback(() => {
    Alert.alert(t('playground.profileMenuButtonChangePassword'))
  }, [t])

  const items = useMemo(
    () => [
      {
        key: 'edit-profile',
        text: t('playground.profileMenuButtonEditProfile'),
        icon: 'person-outline' as const,
        onPress: handleEditProfile,
      },
      {
        key: 'change-password',
        text: t('playground.profileMenuButtonChangePassword'),
        icon: 'lock-closed-outline' as const,
        onPress: handleChangePassword,
      },
    ],
    [handleChangePassword, handleEditProfile, t],
  )

  return (
    <View style={styles.screenContent}>
      <MyText typography="body">{t('playground.profileMenuButtonIntro')}</MyText>
      <ProfileMenuButton items={items} accessibilityLabel={t('dashboard.header.profile')} />
    </View>
  )
}
