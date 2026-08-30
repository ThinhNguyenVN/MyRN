import type { MyAlertType } from './type'
import type { ThemeType } from '@/theme/theme-context'
import { Radius } from '@/theme/radius'
import { StyleSheet } from 'react-native'

const IMAGE_SIZE = 48

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    container: {
      borderRadius: Radius.large,
      overflow: 'hidden',
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
      width: '100%',
      maxWidth: 400,
      padding: getSpacing('x4'),
      gap: getSpacing('x4'),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
    },
    headerTitle: {
      flex: 1,
      color: getColor('text/active/primary'),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
    },
    iconWrap: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageWrap: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      borderRadius: Radius.small,
      overflow: 'hidden',
    },
    textWrap: {
      flex: 1,
      gap: getSpacing('x1'),
      justifyContent: 'center',
    },
    message: {
      color: getColor('text/active/secondary'),
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: getSpacing('x2'),
    },
    footerButtonWrap: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
    },
    footerButtonFill: {
      width: '100%',
    },
  })
}

export const TYPE_ICON_COLOR: Record<MyAlertType, string> = {
  info: 'icon/info/primary',
  success: 'icon/success/primary',
  warning: 'icon/warning/primary',
  error: 'icon/alert/primary',
}
