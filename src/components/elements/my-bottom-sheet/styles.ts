import type { ThemeType } from '@/theme/theme-context'
import { Radius } from '@/theme/radius'
import { StyleSheet } from 'react-native'

const HANDLE_HEIGHT = 10
const HEADER_HEIGHT = 50

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
      height: HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing('x4'),
      borderBottomWidth: 1,
      borderBottomColor: getColor('border/inactive/tertiary'),
      marginTop: -8,
    },
    headerTitleWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: getColor('text/active/primary'),
    },
    headerClose: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x4'),
      paddingBottom: 120,
    },
    footer: {
      paddingHorizontal: getSpacing('x4'),
      paddingBottom: getSpacing('x4'),
    },
  })
}
