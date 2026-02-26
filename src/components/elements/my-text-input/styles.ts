import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'

export type InputState = 'default' | 'disabled' | 'error' | 'focus'

export function getStateColors(theme: ThemeType) {
  const { getColor } = theme
  return {
    default: {
      border: getColor('border/inactive/primary'),
      title: 'text/active/primary' as const,
      subTitle: 'text/active/tertiary' as const,
      value: getColor('text/active/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
    disabled: {
      border: getColor('border/inactive/secondary'),
      title: 'text/inactive/primary' as const,
      subTitle: 'text/inactive/secondary' as const,
      value: getColor('text/inactive/primary'),
      placeholder: getColor('text/inactive/secondary'),
    },
    error: {
      border: getColor('text/alert/primary'),
      title: 'text/alert/primary' as const,
      subTitle: 'text/alert/primary' as const,
      value: getColor('text/alert/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
    focus: {
      border: getColor('border/active/primary'),
      title: 'text/active/primary' as const,
      subTitle: 'text/active/tertiary' as const,
      value: getColor('text/active/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
  }
}

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  const stateColors = getStateColors(theme)
  return {
    stateColors,
    container: {
      gap: getSpacing('x1'),
    },
    inputRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderRadius: Radius.medium,
      backgroundColor: getColor('fill/background/primary'),
      padding: getSpacing('x2'),
      gap: getSpacing('x1'),
    },
    inputBase: {
      fontSize: 16,
      paddingTop: 0,
      paddingBottom: 0,
      flex: 1,
      minWidth: 100,
      textAlignVertical: 'top' as const,
    },
    inputInner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    iconWrap: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },

    titleRow: {
      flexDirection: 'row' as const,
      alignItems: 'baseline' as const,
      gap: getSpacing('x1'),
      marginBottom: getSpacing('x1'),
    },
  }
}
