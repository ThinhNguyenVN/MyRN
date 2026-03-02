import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRef, useEffect } from 'react'
import 'react-native-reanimated'
import { useFonts } from 'expo-font'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { StyleSheet, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ConfirmationRoot, setConfirmationRef } from '@/components/ui/confirmation'
import type { ConfirmationRef } from '@/components/ui/confirmation'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import { MyThemeProvider } from '@/theme/theme-context'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const confirmationRef = useRef<ConfirmationRef | null>(null)

  useEffect(() => {
    setConfirmationRef(confirmationRef)
    return () => setConfirmationRef(null)
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
      <MyThemeProvider value={themeName}>
        <BottomSheetModalProvider>
          <ConfirmationRoot ref={confirmationRef} />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </MyThemeProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
