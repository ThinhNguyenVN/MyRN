import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: -9999,
    top: 0,
    opacity: 0.001,
    pointerEvents: 'none',
  },
  // theme-exempt: rendered off-screen at opacity 0.001 purely to warm up the native shadow
  // layer — this color is never actually seen, so it doesn't need to track the theme.
  surface: {
    width: 100,
    height: 50,
    backgroundColor: '#fff',
  },
})
