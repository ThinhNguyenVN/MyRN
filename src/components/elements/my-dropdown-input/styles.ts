import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export type DropdownInputState = 'default' | 'disabled' | 'error' | 'focus'

export const DROPDOWN_MIN_HEIGHT = 240
export const DROPDOWN_MAX_HEIGHT = 400
export const DROPDOWN_MIN_ITEMS = 5
export const DROPDOWN_ITEM_SIZE = 52
export const DROPDOWN_LIST_DRAW_DISTANCE = 400

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
  const { getColor, getSpacing, getRadius, insets } = theme
  const stateColors = getStateColors(theme)
  return {
    stateColors,
    ...StyleSheet.create({
      container: {
        gap: getSpacing('x1'),
      },
      triggerWrap: {
        width: '100%',
        position: 'relative',
      },
      triggerInput: {
        marginBottom: 0,
      },
      triggerClearHit: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 44,
        height: 44,
        zIndex: 2,
      },
      optionRowInner: {
        width: '100%',
      },
      optionRowMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getSpacing('x4'),
        minHeight: DROPDOWN_ITEM_SIZE,
        gap: getSpacing('x3'),
      },
      optionThumb: {
        width: 36,
        height: 36,
        borderRadius: getRadius('small'),
        overflow: 'hidden',
        backgroundColor: getColor('fill/background/secondary'),
      },
      optionThumbPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: getRadius('small'),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: getColor('fill/background/secondary'),
      },
      optionMark: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: getColor('border/inactive/primary'),
        backgroundColor: getColor('fill/background/tertiary'),
        alignItems: 'center',
        justifyContent: 'center',
      },
      optionMarkRadio: {
        borderRadius: 11,
      },
      optionMarkCheckbox: {
        borderRadius: getRadius('small'),
      },
      optionMarkSelected: {
        borderColor: getColor('border/active/primary'),
        backgroundColor: getColor('fill/active/primary'),
      },
      optionMarkDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: getColor('fill/background/tertiary'),
      },
      clearRow: {
        paddingHorizontal: getSpacing('x4'),
        paddingVertical: getSpacing('x3'),
        minHeight: 44,
        justifyContent: 'center',
      },
      clearRowText: {
        color: getColor('text/active/tertiary'),
      },
      optionLabelMobile: {
        flexShrink: 1,
      },
      optionLabelWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: getSpacing('x2'),
        minWidth: 0,
      },
      optionSuffix: {
        flexShrink: 0,
        color: getColor('text/inactive/primary'),
      },
      optionSuffixSuccess: {
        color: getColor('text/success/primary'),
      },
      optionSuffixWarning: {
        color: getColor('text/warning/primary'),
      },
      optionSuffixAlert: {
        color: getColor('text/alert/primary'),
      },
      relativeWrap: {
        position: 'relative',
      },

      modalBackdrop: {
        flex: 1,
      },

      dropdownPanel: {
        padding: 0,
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
      sheetContent: {
        paddingBottom: (insets.bottom || 0) + getSpacing('x4'),
      },
      sheetListContent: {
        paddingBottom: getSpacing('x6'),
      },
      sheetListContentMobile: {
        paddingHorizontal: 0,
        paddingBottom: (insets.bottom || 0) + getSpacing('x6'),
      },
      pickerRoot: {
        flex: 1,
        backgroundColor: getColor('fill/background/primary'),
      },
      pickerRootAndroid: {
        paddingTop: insets.top,
      },
      pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: getSpacing('x2'),
        paddingLeft: getSpacing('x4'),
        paddingRight: getSpacing('x2'),
        paddingVertical: getSpacing('x4'),
      },
      pickerTitle: {
        flex: 1,
        color: getColor('text/active/primary'),
      },
      pickerCloseHit: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
      },
      searchWrap: {
        paddingHorizontal: getSpacing('x4'),
        paddingBottom: getSpacing('x3'),
      },
      searchWrapWeb: {
        paddingTop: getSpacing('x4'),
      },
      emptyWrap: {
        paddingHorizontal: getSpacing('x4'),
        paddingTop: getSpacing('x8'),
      },
      pickerList: {
        flex: 1,
      },
      pickerKeyboardAvoid: {
        flex: 1,
      },
      sheetPickerContent: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: (insets.bottom || 0) + getSpacing('x4'),
      },
    }),
  }
}
