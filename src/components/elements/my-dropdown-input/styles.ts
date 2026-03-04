import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'
const MAX_INPUT_WIDTH = 400
export type DropdownInputState = 'default' | 'disabled' | 'error' | 'focus'

function getStateColors(theme: ThemeType) {
  const { getColor } = theme
  return {
    default: {
      border: getColor('border/inactive/primary'),
      title: getColor('text/active/primary'),
      subTitle: getColor('text/active/tertiary'),
      value: getColor('text/active/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
    disabled: {
      border: getColor('border/inactive/secondary'),
      title: getColor('text/inactive/primary'),
      subTitle: getColor('text/inactive/secondary'),
      value: getColor('text/inactive/primary'),
      placeholder: getColor('text/inactive/secondary'),
    },
    error: {
      border: getColor('text/alert/primary'),
      title: getColor('text/alert/primary'),
      subTitle: getColor('text/alert/primary'),
      value: getColor('text/alert/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
    focus: {
      border: getColor('border/active/primary'),
      title: getColor('text/active/primary'),
      subTitle: getColor('text/active/tertiary'),
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
    ...StyleSheet.create({
      container: {
        gap: getSpacing('x1'),
      },
      triggerWrap: {
        width: '100%',
      },
      triggerInput: {
        marginBottom: 0,
      },
      optionRowMobile: {
        marginBottom: getSpacing('x2'),
      },
      optionLabelMobile: {
        flex: 1,
      },
      relativeWrap: {
        position: 'relative',
      },

      modalBackdrop: {
        flex: 1,
      },

      dropdownPanel: {
        position: 'absolute',
        maxWidth: MAX_INPUT_WIDTH,
        zIndex: 100,
      },
      dropdownScrollView: {
        borderRadius: Radius.medium,
        backgroundColor: getColor('fill/background/tertiary'),
        borderWidth: 1,
        borderColor: getColor('border/inactive/tertiary'),
        maxHeight: 240,
      },
      optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getSpacing('x4'),
        paddingVertical: getSpacing('x3'),
        minHeight: 44,
      },
      optionRowSelected: {
        backgroundColor: getColor('fill/active/primary'),
      },
      optionText: {
        flex: 1,
        color: getColor('text/active/primary'),
      },
      optionTextSelected: {
        color: getColor('icon/active/tertiary'),
      },
      /** Mobile sheet: list content */
      sheetListContent: {
        paddingBottom: getSpacing('x6'),
      },
    }),
  }
}
