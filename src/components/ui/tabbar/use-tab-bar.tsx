import React, { useCallback, useMemo } from 'react'
import { Platform, StyleSheet, type ColorValue } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BottomTabBar } from 'expo-router/js-tabs'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import { NavigationBar } from '@/components/ui/navigation-bar'
import { ScrollToHideFooter } from '@/components/ui/scroll-to-hide'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateTabBarStyles } from './styles'
import TabBarButton from './tab-bar-button'
import TabBarCenterButton from './tab-bar-center-button'
import type { TabBarCenterAction, TabBarNavItem } from './types'

type TabBarIconProps = {
  focused: boolean
  color: ColorValue
  size: number
}

type UseTabBarArgs = {
  items: TabBarNavItem[]
  /** When set, mobile header shows a menu button that calls this. */
  openDrawer?: () => void
  /**
   * Hide the tab bar on desktop widths (private shell uses a sidebar instead).
   * Public sample tabs keep the bar on all sizes.
   */
  mobileOnly?: boolean
  /**
   * Raised action button inserted in the middle of the tabs. It needs a route of the same `id`
   * under the Tabs layout (a redirect is enough), but pressing it runs `onPress` instead.
   */
  centerAction?: TabBarCenterAction
}

type TabBarButtonRenderProps = React.ComponentProps<typeof TabBarButton>

type TabRouteState = {
  index: number
  routes: { key: string; name: string; state?: { index?: number; routes?: { name: string }[] } }[]
}

type TabScreen = {
  id: string
  title: string
  renderIcon: (props: TabBarIconProps) => React.ReactNode
  /** Set only for the center action: replaces the tab button so pressing it never switches tabs. */
  tabBarButton?: (props: TabBarButtonRenderProps) => React.ReactNode
}

/** Hide chrome when a tab hosts a nested stack focused on a child (not `index`). */
function shouldHideTabBar(state: TabRouteState, tabBarStyle: unknown): boolean {
  const focused = state.routes[state.index]
  const nested = focused?.state
  if (nested?.routes && nested.index !== undefined) {
    const nestedRoute = nested.routes[nested.index]
    if (nestedRoute && nestedRoute.name !== 'index') {
      return true
    }
  }

  const flat = StyleSheet.flatten(tabBarStyle as object) as
    | { display?: string; height?: number }
    | undefined
  return flat?.display === 'none' || flat?.height === 0
}

/** Tabs `screenOptions` + custom tab bar. */
export function useTabBar({ items, openDrawer, mobileOnly = false, centerAction }: UseTabBarArgs) {
  const { t } = useTranslation()
  const { getColor } = useTheme()
  const isMobileSize = useIsMobileSize()
  const styles = useThemedStyles(generateTabBarStyles)
  const activeTint = getColor('brand/primary')
  const inactiveTint = getColor('icon/inactive/primary')
  const tabBarBorderColor = getColor('border/inactive/secondary')
  const showChrome = !mobileOnly || isMobileSize

  const renderTabBar = useCallback(
    (props: React.ComponentProps<typeof BottomTabBar>) => {
      if (!showChrome) {
        return null
      }
      const focusedRoute = props.state.routes[props.state.index]
      const focusedOptions = props.descriptors[focusedRoute.key]?.options
      if (shouldHideTabBar(props.state as TabRouteState, focusedOptions?.tabBarStyle)) {
        return null
      }
      return (
        <ScrollToHideFooter style={styles.tabBarFooter}>
          <BottomTabBar {...props} insets={{ ...props.insets, bottom: 0, top: 0 }} />
        </ScrollToHideFooter>
      )
    },
    [showChrome, styles.tabBarFooter],
  )

  const screenOptions = useMemo(
    () => ({
      headerShown: Boolean(openDrawer) && isMobileSize,
      tabBarActiveTintColor: activeTint,
      tabBarInactiveTintColor: inactiveTint,
      tabBarActiveBackgroundColor: 'transparent' as const,
      // Inline last so it beats BottomTabBar's light-theme `borderColor` on web.
      tabBarStyle: [
        styles.tabBar,
        {
          borderColor: tabBarBorderColor,
          borderTopColor: tabBarBorderColor,
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
          ...(Platform.OS === 'web' ? { boxShadow: 'none' } : null),
        },
      ],
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarIconStyle: styles.tabBarIcon,
      // Must be a function — memo()'d components are objects and crash BottomTabBar.
      tabBarButton: (props: React.ComponentProps<typeof TabBarButton>) => (
        <TabBarButton {...props} />
      ),
      header: ({ options }: { options: { title?: string } }) => (
        <NavigationBar
          title={options.title}
          showBack={false}
          left={
            openDrawer ? (
              <MyButton.Icon
                icon="menu"
                type="light"
                size="small"
                onPress={openDrawer}
                accessibilityLabel={t('shell.drawer.open')}
              />
            ) : undefined
          }
        />
      ),
    }),
    [activeTint, inactiveTint, isMobileSize, openDrawer, styles, t, tabBarBorderColor],
  )

  const tabScreens = useMemo(() => {
    const screens: TabScreen[] = items.map((item) => ({
      id: item.id,
      title: t(item.labelKey),
      renderIcon: ({ color, focused }: TabBarIconProps) => (
        <MyIcon
          name={focused && item.iconFocused ? item.iconFocused : item.icon}
          size={22}
          color={typeof color === 'string' ? color : activeTint}
        />
      ),
    }))
    if (!centerAction) {
      return screens
    }
    const label = t(centerAction.labelKey)
    const accessibilityLabel = t(centerAction.accessibilityLabelKey ?? centerAction.labelKey)
    screens.splice(Math.ceil(screens.length / 2), 0, {
      id: centerAction.id,
      title: label,
      renderIcon: () => null,
      // Must be a function — memo()'d components are objects and crash BottomTabBar.
      tabBarButton: (props: TabBarButtonRenderProps) => (
        <TabBarCenterButton
          label={label}
          icon={centerAction.icon}
          mark={centerAction.mark}
          onPress={centerAction.onPress}
          accessibilityLabel={accessibilityLabel}
          badge={centerAction.badge}
          accentColor={centerAction.accentColor}
          style={props.style}
        />
      ),
    })
    return screens
  }, [activeTint, centerAction, items, t])

  return {
    isMobileSize,
    renderTabBar,
    screenOptions,
    tabScreens,
  }
}
