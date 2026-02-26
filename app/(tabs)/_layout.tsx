import { Tabs } from 'expo-router'
import React from 'react'

import { HapticTab } from '@/components/ui/haptic-tab'
import { useTheme } from '@/theme/theme-context'
import MyIcon from '@/components/elements/my-icon'

export default function TabLayout() {
  const { getColor } = useTheme()
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getColor('fill/active/primary'),
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MyIcon name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MyIcon name={'paper-plane-sharp'} size={28} color={color} />,
        }}
      />
    </Tabs>
  )
}
