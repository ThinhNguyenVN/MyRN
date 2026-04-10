import React from 'react'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import { useIsMobile } from '@/hooks/dimenstions-hooks'
import { useTheme } from '@/theme/theme-context'

const screenOptions = {
  header: (props: any) => <NavigationBarHeader {...props} />,
  headerShown: true,
  title: '',
} as const

export default function ButtonsLayout() {
  const isMobile = useIsMobile()
  const { getColor } = useTheme()
  const { t } = useTranslation()
  return (
    <Stack
      screenOptions={({ route }) => ({
        ...screenOptions,
        title:
          route.name === 'detail'
            ? t('playground.buttonsDetailTitle')
            : t('playground.linksButtons'),
        contentStyle: { backgroundColor: getColor('brand/white') },
        header: (props: any) => (
          <NavigationBarHeader {...props} hideBackButton={!isMobile && route.name === 'index'} />
        ),
      })}
    />
  )
}
