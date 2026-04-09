import React, { useCallback, useEffect } from 'react'
import { router, Stack, usePathname } from 'expo-router'
import { Platform, View } from 'react-native'

import { ScrollToHideHeader } from '@/components/ui/scroll-to-hide'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import SideBar, { SideBarItem } from '@/components/ui/side-bar'
import { useShowSidebar } from '@/hooks/dimenstions-hooks'
import { PLAYGROUND_LINKS } from './constants'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'

function titleFromRoute(routeName: string): string {
  if (routeName === 'toast') return 'Toast & Confirmation'
  if (routeName === 'swipeable-item') return 'Swipeable item'
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
  const { getColor } = useTheme()

  const styles = useThemedStyles(generateStyles)

  useEffect(() => {
    if (Platform.OS !== 'web' || !showSidebar) return
    const path = pathname.replace(/\?.*$/, '').replace(/\/$/, '')
    const isPlaygroundIndex = path === '/playground' || path === '/(tabs)/playground'
    if (isPlaygroundIndex) {
      router.replace('/playground/my-list')
    }
  }, [pathname, showSidebar])

  const handleSelected = useCallback(
    (item: SideBarItem) => {
      if (item.href === pathname) return
      router.replace(item.href as any)
    },
    [pathname],
  )

  if (!showSidebar) {
    return (
      <Stack
        screenOptions={({ route }) => {
          const isMyListRoute = route.name === 'my-list/index'
          return {
            ...screenOptions,
            title: titleFromRoute(route.name ?? ''),
            contentStyle: { backgroundColor: getColor('brand/white') },
            header: (props) =>
              isMyListRoute ? (
                <ScrollToHideHeader>
                  <NavigationBarHeader {...props} />
                </ScrollToHideHeader>
              ) : (
                <NavigationBarHeader {...props} />
              ),
            headerShown: route.name !== 'my-list',
          }
        }}
      />
    )
  }

  return (
    <View style={styles.sideBarContainer}>
      <SideBar data={PLAYGROUND_LINKS} onSelected={handleSelected} style={styles.sidebarWrapper} />
      <View style={styles.contentContainer} collapsable={false}>
        <Stack
          initialRouteName="buttons"
          screenOptions={({ route }) => {
            const isButtonsRoute = route.name === 'buttons'
            const isMyListRoute = route.name === 'my-list/index'
            return {
              ...screenOptions,
              title: titleFromRoute(route.name ?? ''),
              contentStyle: { backgroundColor: getColor('brand/white') },
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
