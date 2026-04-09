import React from 'react'
import { Stack } from 'expo-router'

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
  return (
    <Stack
      screenOptions={({ route }) => ({
        ...screenOptions,
        title: route.name === 'detail' ? 'Buttons Detail' : 'Buttons',
        contentStyle: { backgroundColor: getColor('brand/white') },
        header: (props: any) => (
          <NavigationBarHeader {...props} hideBackButton={!isMobile && route.name === 'index'} />
        ),
      })}
    />
  )
}
