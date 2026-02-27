import type { ThemeType } from '@/theme/theme-context'
import { Radius } from '@/theme/radius'
import { StyleSheet } from 'react-native'

const HANDLE_HEIGHT = 12

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    sheet: {
      borderTopLeftRadius: Radius.small,
      borderTopRightRadius: Radius.small,
    },
    sheetBackground: {
      backgroundColor: getColor('fill/background/tertiary'),
      borderTopLeftRadius: Radius.small,
      borderTopRightRadius: Radius.small,
    },
    sheetInner: {
      flex: 1,
    },
    handleShadow: {
      width: '100%',
      height: HANDLE_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    handleIndicator: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: getColor('border/active/primary'),
    },
    header: {
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x2'),
      paddingBottom: getSpacing('x4'),
      borderBottomWidth: 1,
      borderBottomColor: getColor('border/inactive/tertiary'),
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: getColor('text/active/primary'),
    },
    content: {
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x4'),
      paddingBottom: getSpacing('x8'),
    },
    footer: {
      paddingHorizontal: getSpacing('x4'),
      paddingBottom: getSpacing('x4'),
    },
  })
}
