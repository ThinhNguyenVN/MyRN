import React, { useEffect } from 'react'
import { router, Stack, usePathname } from 'expo-router'
import { Platform, View } from 'react-native'

import { ScrollToHideHeader } from '@/components/ui/scroll-to-hide'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import SideBar, { SideBarItem } from '@/components/ui/side-bar'
import { useShowSidebar } from '@/hooks/dimenstions-hooks'
import { PLAYGROUND_LINKS } from './constants'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'

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
  const pathname = usePathname()

  const styles = useThemedStyles(generateStyles)

  useEffect(() => {
    if (Platform.OS !== 'web' || !showSidebar) return
    const path = pathname.replace(/\?.*$/, '').replace(/\/$/, '')
    const isPlaygroundIndex = path === '/playground' || path === '/(tabs)/playground'
    if (isPlaygroundIndex) {
      router.replace('/playground/buttons')
    }
  }, [pathname, showSidebar])

  if (!showSidebar) {
    return (
      <Stack
        screenOptions={({ route }) => {
          const isMyListRoute = route.name === 'my-list/index'
          return {
            ...screenOptions,
            title: titleFromRoute(route.name ?? ''),
            header: (props) =>
              isMyListRoute ? (
                <ScrollToHideHeader>
                  <NavigationBarHeader {...props} />
                </ScrollToHideHeader>
              ) : (
                <NavigationBarHeader {...props} />
              ),
            headerShown: route.name !== 'buttons',
          }
        }}
      />
    )
  }

  const handleSelected = (item: SideBarItem) => {
    router.replace(item.href as any)
  }

  return (
    <View style={styles.sideBarContainer}>
      <SideBar data={PLAYGROUND_LINKS} onSelected={handleSelected} />
      <View style={styles.contentContainer}>
        <Stack
          initialRouteName="buttons"
          screenOptions={({ route }) => {
            const isButtonsRoute = route.name === 'buttons'
            const isMyListRoute = route.name === 'my-list/index'
            return {
              ...screenOptions,
              title: titleFromRoute(route.name ?? ''),
              header: (props) =>
                isMyListRoute ? (
                  <ScrollToHideHeader>
                    <NavigationBarHeader {...props} hideBackButton />
                  </ScrollToHideHeader>
                ) : (
                  <NavigationBarHeader {...props} hideBackButton />
                ),
              headerShown: !isButtonsRoute,
            }
          }}
        />
      </View>
    </View>
  )
}
