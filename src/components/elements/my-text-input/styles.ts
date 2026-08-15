import { MAX_INPUT_WIDTH } from '@/constants/dimensions'
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
  const { getSpacing, getColor } = theme
  const stateColors = getStateColors(theme)
  return {
    stateColors,
    container: {
      maxWidth: MAX_INPUT_WIDTH,
    },
    inputRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderRadius: Radius.large,
      paddingHorizontal: getSpacing('x3'),
      gap: getSpacing('x1'),
      alignItems: 'center' as const,
      minHeight: 44,
      backgroundColor: getColor('fill/background/tertiary'),
    },
    inputBase: {
      fontSize: 16,
      flex: 1,
      minWidth: 100,
      textAlignVertical: 'top' as const,
    },
    inputMultilinePadding: {
      paddingTop: getSpacing('x2'),
      paddingBottom: getSpacing('x2'),
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
    error: {
      marginTop: getSpacing('x1'),
    },
    title: {
      marginBottom: getSpacing('x1'),
    },
  }
}
