import type { ThemeType } from '@/theme/theme-context'
import { Radius } from '@/theme/radius'
import { StyleSheet } from 'react-native'

const IMAGE_SIZE = 48

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    container: {
      borderRadius: Radius.medium,
      overflow: 'hidden',
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/tertiary'),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing('x4'),
      borderBottomWidth: 1,
      borderBottomColor: getColor('border/inactive/tertiary'),
      justifyContent: 'space-between',
    },
    headerTitle: {
      flex: 1,
      color: getColor('text/active/primary'),
    },

    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing('x4'),
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
}
