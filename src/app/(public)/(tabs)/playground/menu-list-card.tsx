import { useCallback, useMemo } from 'react'
import { Alert, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { MenuListCard } from '@/components/ui/menu-list-card'
import { generateStyles } from '@/features/playground/styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function MenuListCardScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleInfo = useCallback(() => {
    Alert.alert(t('playground.menuListCardInfo'))
  }, [t])

  const handlePassword = useCallback(() => {
    Alert.alert(t('playground.menuListCardPassword'))
  }, [t])

  const items = useMemo(
    () => [
      {
        key: 'info',
        icon: 'person-outline' as const,
        label: t('playground.menuListCardInfo'),
        onPress: handleInfo,
      },
      {
        key: 'password',
        icon: 'lock-closed-outline' as const,
        label: t('playground.menuListCardPassword'),
        onPress: handlePassword,
      },
    ],
    [handleInfo, handlePassword, t],
  )

  return (
    <View style={styles.screenContent}>
      <MyText typography="body">{t('playground.menuListCardIntro')}</MyText>
      <MenuListCard title={t('playground.menuListCardTitle')} items={items} />
    </View>
  )
}
