import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRef, useEffect } from 'react'
import 'react-native-reanimated'
import { useFonts } from 'expo-font'

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

import { store } from '@/store/store'

export const unstable_settings = {
  anchor: '(tabs)',
}

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

  const [fontsLoaded] = useFonts({
    Roboto: require('@/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('@/assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('@/assets/fonts/Roboto-Bold.ttf'),
  })
  if (!fontsLoaded) {
    return null
  }

  const themeName = colorScheme === 'dark' ? 'dark' : 'light'

  return (
    <GestureHandlerRootView style={styles.root}>
      <PortalProvider shouldAddRootHost={false}>
        <MyThemeProvider value={themeName}>
          <Provider store={store}>
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
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <View style={styles.portalHostOverlay} pointerEvents="box-none">
                  <PortalHost name="root" />
                </View>
                <StatusBar style="auto" />
              </BottomSheetModalProvider>
            </ScrollToHideProvider>
          </Provider>
        </MyThemeProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  )
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
