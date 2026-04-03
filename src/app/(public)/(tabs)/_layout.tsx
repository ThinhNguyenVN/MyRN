import { Tabs } from 'expo-router'
import React from 'react'

import { ScrollToHideFooter } from '@/components/ui/scroll-to-hide'
import { BottomTabBar } from '@react-navigation/bottom-tabs'
import { useTheme } from '@/theme/theme-context'
import MyIcon from '@/components/elements/my-icon'
import MyPressable, { SCALE_SMALL } from '@/components/elements/my-pressable'
import MyView from '@/components/elements/my-view'

export default function TabLayout() {
  const { getColor } = useTheme()
  return (
    <MyView flex={1}>
      <Tabs
        tabBar={(props) => (
          <ScrollToHideFooter>
            <BottomTabBar {...props} />
          </ScrollToHideFooter>
        )}
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
          name="playground"
          options={{
            title: 'Playground',
            tabBarIcon: ({ color }) => <MyIcon name="grid-outline" size={28} color={color} />,
          }}
        />
      </Tabs>
    </MyView>
  )
}
