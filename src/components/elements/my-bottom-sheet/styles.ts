import { MAX_INPUT_WIDTH } from '@/constants/dimensions'
import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

const HEADER_HEIGHT = 44

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing, insets } = theme
  return StyleSheet.create({
    sheet: {
      borderTopLeftRadius: Radius.medium,
      borderTopRightRadius: Radius.medium,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: getSpacing('x4'),
    },
    modalPanel: {
      width: '100%',
      maxWidth: MAX_INPUT_WIDTH,
      borderRadius: Radius.medium,
      backgroundColor: getColor('fill/background/tertiary'),
      overflow: 'hidden',
    },
    header: {
      height: HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing('x4'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/tertiary'),
    },
    headerTitleWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: getColor('text/active/primary'),
    },
    headerClose: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x2'),
      paddingBottom: getSpacing('x4'),
    },
    footer: {
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x4'),
      paddingBottom: getSpacing('x2'),
    },
    modalFooter: {
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x4'),
      paddingBottom: insets.bottom || getSpacing('x2'),
    },
  })
}
