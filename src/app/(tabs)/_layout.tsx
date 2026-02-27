import { Tabs } from 'expo-router'
import React from 'react'

import { useTheme } from '@/theme/theme-context'
import MyIcon from '@/components/elements/my-icon'
import MyPressable, { SCALE_SMALL } from '@/components/elements/my-pressable'

export default function TabLayout() {
  const { getColor } = useTheme()
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getColor('fill/active/primary'),
        headerShown: false,
        tabBarButton(props) {
          return <MyPressable {...(props as any)} scaleBySize={false} scaleValue={SCALE_SMALL} />
        },
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
