import React, { useCallback, useEffect, useMemo } from 'react'
import { router, Stack, usePathname } from 'expo-router'
import { Platform, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ScrollToHideHeader } from '@/components/ui/scroll-to-hide'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import SideBar, { SideBarItem } from '@/components/ui/side-bar'
import { useShowSidebar } from '@/hooks/dimenstions-hooks'
import { PLAYGROUND_LINKS } from '@/features/playground/constants'
import { titleFromRoute } from '@/features/playground/title-from-route'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from '@/features/playground/styles'

/** Deep links (e.g. /playground/bottom-sheet) get `index` under them so Back returns to the menu. */
export const unstable_settings = {
  initialRouteName: 'index',
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
  const { t } = useTranslation()

  const styles = useThemedStyles(generateStyles)
  const sideBarLinks = useMemo(
    () => PLAYGROUND_LINKS.map((item) => ({ href: item.href, label: t(item.labelKey) })),
    [t],
  )

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
        initialRouteName="index"
        screenOptions={({ route }) => {
          const isMyListRoute = route.name === 'my-list/index'
          return {
            ...screenOptions,
            title: t(titleFromRoute(route.name ?? '')),
            contentStyle: { backgroundColor: getColor('brand/white') },
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

  return (
    <View style={styles.sideBarContainer}>
      <SideBar data={sideBarLinks} onSelected={handleSelected} style={styles.sidebarWrapper} />
      <View style={styles.contentContainer} collapsable={false}>
        <Stack
          initialRouteName="buttons"
          screenOptions={({ route }) => {
            const isButtonsRoute = route.name === 'buttons'
            const isMyListRoute = route.name === 'my-list/index'
            return {
              ...screenOptions,
              title: t(titleFromRoute(route.name ?? '')),
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
