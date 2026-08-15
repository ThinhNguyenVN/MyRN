import type { MyAlertType } from './type'
import type { ThemeType } from '@/theme/theme-context'
import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing('x5'),
      paddingTop: getSpacing('x5'),
      paddingBottom: getSpacing('x3'),
      gap: getSpacing('x3'),
    },
    headerTitle: {
      flex: 1,
      color: getColor('text/active/primary'),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: getSpacing('x5'),
      paddingBottom: getSpacing('x4'),
      gap: getSpacing('x3'),
    },
    iconWrap: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: getSpacing('x1'),
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
      paddingHorizontal: getSpacing('x5'),
      paddingBottom: getSpacing('x5'),
      gap: getSpacing('x2'),
      minHeight: BUTTON_SMALL_HEIGHT + getSpacing('x5'),
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
