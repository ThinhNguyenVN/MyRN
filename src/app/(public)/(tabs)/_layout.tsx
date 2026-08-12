import { Tabs } from 'expo-router'
import React, { useMemo } from 'react'

import MyView from '@/components/elements/my-view'
import { useTabBar, type TabBarNavItem } from '@/components/ui/tabbar'

const PUBLIC_TAB_NAV: TabBarNavItem[] = [
  {
    id: 'index',
    labelKey: 'tabs.home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    id: 'playground',
    labelKey: 'tabs.playground',
    icon: 'grid-outline',
    iconFocused: 'grid',
  },
]

export default function TabLayout() {
  const items = useMemo(() => PUBLIC_TAB_NAV, [])
  const { renderTabBar, screenOptions, tabScreens } = useTabBar({ items })

  return (
    <MyView flex={1}>
      <Tabs tabBar={renderTabBar} screenOptions={screenOptions}>
        {tabScreens.map((item) => (
          <Tabs.Screen
            key={item.id}
            name={item.id}
            options={{
              title: item.title,
              tabBarIcon: item.renderIcon,
            }}
          />
        ))}
      </Tabs>
    </MyView>
  )
}
