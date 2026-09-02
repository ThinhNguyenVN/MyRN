import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRef, useEffect } from 'react'
import 'react-native-reanimated'
import * as SplashScreen from 'expo-splash-screen'
import '@/i18n'

import { PortalHost, PortalProvider } from '@gorhom/portal'
import { StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ConfirmationRoot, setConfirmationRef } from '@/components/ui/confirmation'
import type { ConfirmationRef } from '@/components/ui/confirmation'
import { ToastRoot, setToastRef } from '@/components/ui/toast'
import type { ToastRef } from '@/components/ui/toast'
import { MyThemeProvider } from '@/theme/theme-context'
import { ScrollToHideProvider } from '@/components/ui/scroll-to-hide'
import { SiteSeo } from '@/components/ui/site-seo'
import { Provider } from 'react-redux'

import { useAppInit } from '@/hooks/app-init-hooks'
import { useHydratedColorScheme } from '@/hooks/color-scheme-hooks'
import { store } from '@/store/store'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useHydratedColorScheme()
  const confirmationRef = useRef<ConfirmationRef | null>(null)
  const toastRef = useRef<ToastRef | null>(null)

  useEffect(() => {
    setConfirmationRef(confirmationRef)
    setToastRef(toastRef)
    return () => {
      setConfirmationRef(null)
      setToastRef(null)
    }
  }, [])

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Rendered unconditionally, outside AppInitGate, so document <head> meta tags
          are present in the static web export even though AppInitGate blocks the rest
          of the tree until font/notification init resolves. No-op on native (see
          `.docs/seo-standard.md`). Disabled entirely unless `seo.config.json.enabled`. */}
      <SiteSeo />
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <PortalProvider shouldAddRootHost={false}>
          <MyThemeProvider value={colorScheme}>
            <Provider store={store}>
              <AppInitGate>
                <ScrollToHideProvider>
                  <ConfirmationRoot ref={confirmationRef} />
                  <ToastRoot ref={toastRef} />
                  <Stack>
                    <Stack.Screen name="(public)" options={{ headerShown: false }} />
                    <Stack.Screen name="(private)" options={{ headerShown: false }} />
                  </Stack>
                  <View style={styles.portalHostOverlay} pointerEvents="box-none">
                    <PortalHost name="root" />
                  </View>
                  <StatusBar style="auto" />
                </ScrollToHideProvider>
              </AppInitGate>
            </Provider>
          </MyThemeProvider>
        </PortalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}

function AppInitGate({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAppInit()

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync()
    }
  }, [isInitialized])

  if (!isInitialized) return null

  return <>{children}</>
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  portalHostOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
})
