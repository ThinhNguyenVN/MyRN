import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (_theme: ThemeType) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
  })
