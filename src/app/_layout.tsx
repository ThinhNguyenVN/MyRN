import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRef, useEffect } from 'react'
import 'react-native-reanimated'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { PortalHost, PortalProvider } from '@gorhom/portal'
import { StyleSheet, useColorScheme, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ConfirmationRoot, setConfirmationRef } from '@/components/ui/confirmation'
import type { ConfirmationRef } from '@/components/ui/confirmation'
import { ToastRoot, setToastRef } from '@/components/ui/toast'
import type { ToastRef } from '@/components/ui/toast'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import { MyThemeProvider } from '@/theme/theme-context'
import { ScrollToHideProvider } from '@/components/ui/scroll-to-hide'
import { Provider } from 'react-redux'

import { useAppInit } from '@/hooks/app-init-hooks'
import { store } from '@/store/store'

export default function RootLayout() {
  const colorScheme = useColorScheme()
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

  const themeName = colorScheme === 'dark' ? 'dark' : 'light'

  return (
    <GestureHandlerRootView style={styles.root}>
      <PortalProvider shouldAddRootHost={false}>
        <MyThemeProvider value={themeName}>
          <Provider store={store}>
            <AppInitGate>
              <ScrollToHideProvider>
                <BottomSheetModalProvider>
                  <ConfirmationRoot ref={confirmationRef} />
                  <ToastRoot ref={toastRef} />
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="home"
                      options={{
                        header: (props) => <NavigationBarHeader {...props} />,
                        headerShown: true,
                        title: 'Home',
                      }}
                    />
                  </Stack>
                  <View style={styles.portalHostOverlay} pointerEvents="box-none">
                    <PortalHost name="root" />
                  </View>
                  <StatusBar style="auto" />
                </BottomSheetModalProvider>
              </ScrollToHideProvider>
            </AppInitGate>
          </Provider>
        </MyThemeProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  )
}

function AppInitGate({ children }: { children: React.ReactNode }) {
  const { isInitializing } = useAppInit()
  if (isInitializing) {
    return <View style={styles.root} />
  }
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
