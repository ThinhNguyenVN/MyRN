import type { MyAlertType } from './type'
import type { ThemeType } from '@/theme/theme-context'
import { Radius } from '@/theme/radius'
import { StyleSheet } from 'react-native'

const IMAGE_SIZE = 48

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  const endColor = getColor('fill/background/tertiary')
  const headerByType: Record<
    MyAlertType,
    {
      startColor: string
      endColor: string
      borderBottomColor: string
      titleColor: string
      iconColor: string
    }
  > = {
    info: {
      startColor: getColor('fill/info/primary'),
      endColor,
      borderBottomColor: getColor('border/info/primary'),
      titleColor: getColor('text/info/primary'),
      iconColor: getColor('icon/info/primary'),
    },
    success: {
      startColor: getColor('fill/success/primary'),
      endColor,
      borderBottomColor: getColor('border/success/primary'),
      titleColor: getColor('text/success/primary'),
      iconColor: getColor('icon/success/primary'),
    },
    warning: {
      startColor: getColor('fill/warning/primary'),
      endColor,
      borderBottomColor: getColor('border/warning/primary'),
      titleColor: getColor('text/warning/primary'),
      iconColor: getColor('icon/warning/primary'),
    },
    error: {
      startColor: getColor('fill/alert/primary'),
      endColor,
      borderBottomColor: getColor('border/alert/primary'),
      titleColor: getColor('text/alert/primary'),
      iconColor: getColor('icon/alert/primary'),
    },
  }
  const sheet = StyleSheet.create({
    container: {
      borderRadius: Radius.medium,
      overflow: 'hidden',
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/tertiary'),
      width: '100%',
      maxWidth: 400,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing('x4'),
      borderBottomWidth: 1,
      justifyContent: 'space-between',
    },
    headerGradient: {
      position: 'absolute',
      left: 0,
      top: 0,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      zIndex: 1,
    },
    headerBorderInfo: { borderBottomColor: headerByType.info.borderBottomColor },
    headerBorderSuccess: { borderBottomColor: headerByType.success.borderBottomColor },
    headerBorderWarning: { borderBottomColor: headerByType.warning.borderBottomColor },
    headerBorderError: { borderBottomColor: headerByType.error.borderBottomColor },
    headerTitleInfo: { flex: 1, color: headerByType.info.titleColor },
    headerTitleSuccess: { flex: 1, color: headerByType.success.titleColor },
    headerTitleWarning: { flex: 1, color: headerByType.warning.titleColor },
    headerTitleError: { flex: 1, color: headerByType.error.titleColor },
    headerTitleTextInfo: { color: headerByType.info.titleColor },
    headerTitleTextSuccess: { color: headerByType.success.titleColor },
    headerTitleTextWarning: { color: headerByType.warning.titleColor },
    headerTitleTextError: { color: headerByType.error.titleColor },

    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing('x4'),
      paddingTop: 20,
      gap: getSpacing('x3'),
      justifyContent: 'center',
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
      fontSize: 15,
      fontWeight: '500',
      color: getColor('text/active/primary'),
    },
    description: {
      fontSize: 14,
      color: getColor('text/active/secondary'),
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x3'),
      gap: getSpacing('x2'),
      borderTopWidth: 1,
      borderTopColor: getColor('border/inactive/tertiary'),
    },
  })
  return { ...sheet, headerGradientByType: headerByType }
}
