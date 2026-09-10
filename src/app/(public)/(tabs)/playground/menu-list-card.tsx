import { useCallback, useMemo, useState } from 'react'
import { Alert, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySegment from '@/components/elements/my-segment'
import MyText from '@/components/elements/my-text'
import { MenuListCard } from '@/components/ui/menu-list-card'
import { generateStyles } from '@/features/playground/styles'
import { useThemedStyles } from '@/theme/theme-context'

type PeriodId = 'month' | 'year'

export default function MenuListCardScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [period, setPeriod] = useState<PeriodId>('month')

  const handleInfo = useCallback(() => {
    Alert.alert(t('playground.menuListCardInfo'))
  }, [t])

  const handlePassword = useCallback(() => {
    Alert.alert(t('playground.menuListCardPassword'))
  }, [t])

  const periodOptions = useMemo(
    () => [
      { value: 'month' as const, label: t('playground.segmentBillingMonth') },
      { value: 'year' as const, label: t('playground.segmentBillingYear') },
    ],
    [t],
  )

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
      {
        key: 'period',
        icon: 'calendar-outline' as const,
        label: t('playground.menuListCardPeriod'),
        trailing: (
          <MySegment
            options={periodOptions}
            value={period}
            onChange={setPeriod}
            size="compact"
            accessibilityLabel={t('playground.menuListCardPeriod')}
          />
        ),
      },
    ],
    [handleInfo, handlePassword, period, periodOptions, t],
  )

  return (
    <View style={styles.screenContent}>
      <MyText typography="body">{t('playground.menuListCardIntro')}</MyText>
      <MenuListCard title={t('playground.menuListCardTitle')} items={items} />
    </View>
  )
}
