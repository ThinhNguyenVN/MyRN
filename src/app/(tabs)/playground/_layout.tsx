import React from 'react'
import { Stack } from 'expo-router'
import { View } from 'react-native'

import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import SideBar from '@/components/ui/side-bar'
import { useShowSidebar } from '@/hooks/dimenstions-hooks'
import { PLAYGROUND_LINKS } from './constants'

function titleFromRoute(routeName: string): string {
  if (routeName === 'toast') return 'Toast & Confirmation'
  return routeName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const screenOptions = {
  header: (props: any) => <NavigationBarHeader {...props} />,
  headerShown: true,
  title: '',
} as const

export default function PlaygroundLayout() {
  const showSidebar = useShowSidebar()

  if (!showSidebar) {
    return (
      <Stack
        screenOptions={({ route }) => ({
          ...screenOptions,
          title: titleFromRoute(route.name ?? ''),
        })}
      />
    )
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <SideBar data={PLAYGROUND_LINKS} />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Stack
          screenOptions={({ route }) => ({
            ...screenOptions,

            title: titleFromRoute(route.name ?? ''),
          })}
        />
      </View>
    </View>
  )
}
