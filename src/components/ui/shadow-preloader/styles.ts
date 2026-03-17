import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: -9999,
    top: 0,
    opacity: 0.001,
    pointerEvents: 'none',
  },
  surface: {
    width: 100,
    height: 50,
    backgroundColor: '#fff',
  },
})
