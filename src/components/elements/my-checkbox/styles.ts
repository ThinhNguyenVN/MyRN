import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

const BOX_SIZE = 22

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
    },
    box: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      borderWidth: 1,
      borderColor: getColor('border/inactive/primary'),
      backgroundColor: getColor('fill/background/tertiary'),
      justifyContent: 'center',
      alignItems: 'center',
    },

    boxChecked: {
      borderColor: getColor('border/active/primary'),
      backgroundColor: getColor('fill/active/primary'),
    },
    boxDisabled: {
      opacity: 0.5,
    },
    checkmark: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkedContentWrap: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioDot: {
      alignSelf: 'center',
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: getColor('fill/background/tertiary'),
    },
    label: {
      flex: 1,
    },
  })
}
