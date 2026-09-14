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

import { AppInitProvider, useAppInit } from '@/hooks/app-init-hooks'
import { isWeb } from '@/constants/dimensions'
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
              {/* `useAppInit()` dispatches Redux actions (via `useInitAuth`), so it MUST run
                  in a component rendered *inside* `<Provider>` — never in `RootLayout` itself,
                  which renders `<Provider>` as a child and is therefore not a descendant of it.
                  Calling a `useDispatch()`-consuming hook above `<Provider>` in the tree makes
                  `expo export`'s static server render silently suspend the entire route tree
                  (an empty `<title>` and a permanently-pending Suspense boundary in the
                  generated HTML, with no thrown error) — see `.docs/seo-standard.md` for the
                  full writeup. `AppInitBridge` exists solely to keep this hook correctly nested. */}
              <AppInitBridge>
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
              </AppInitBridge>
            </Provider>
          </MyThemeProvider>
        </PortalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}

/** Runs `useAppInit()` inside `<Provider>` (see comment above) and gates web/native. */
function AppInitBridge({ children }: { children: React.ReactNode }) {
  const { isInitialized, initErrors } = useAppInit()

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync()
    }
  }, [isInitialized])

  return (
    <AppInitProvider value={{ isInitialized, initErrors }}>
      <AppInitGate isInitialized={isInitialized}>{children}</AppInitGate>
    </AppInitProvider>
  )
}

/**
 * Web: never block on `isInitialized` — `useEffect` (where `isInitialized`
 * flips to `true`) never runs during `expo export`'s static prerender pass,
 * so blocking here would make the whole route tree (content + per-screen SEO
 * tags) missing from the generated HTML. Content renders immediately; auth/
 * fonts/locale resolve progressively after hydration. `(private)/_layout.tsx`
 * has its own `isInitialized` check (via `useAppInitState`) so protected
 * routes still wait for auth restore before deciding to redirect — this only
 * relaxes the gate for `(public)` content.
 * Native: unchanged, still waits so there's no flash before splash hides.
 */
function AppInitGate({
  isInitialized,
  children,
}: {
  isInitialized: boolean
  children: React.ReactNode
}) {
  if (!isInitialized && !isWeb) return null

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
