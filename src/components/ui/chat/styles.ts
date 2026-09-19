import { StyleSheet, type TextStyle } from 'react-native'

import { isWeb, MAX_CHAT_WIDTH } from '@/constants/dimensions'
import type { ThemeType } from '@/theme/theme-context'

export const MIN_COMPOSER_HEIGHT = 24
export const COMPOSER_ACTIONS_HEIGHT = 40
export const COMPOSER_INPUT_LINE_HEIGHT = 22

export function getChatColumnGutter(
  columnWidth: number,
  isMobileSize: boolean,
  spacingX6: number,
): number {
  if (isMobileSize) {
    return spacingX6
  }
  if (columnWidth <= MAX_CHAT_WIDTH) {
    return 0
  }
  return (columnWidth - MAX_CHAT_WIDTH) / 2
}

const MAX_BUBBLE_WIDTH = '100%'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing, getColor, insets, isMobileSize, isMobile } = theme

  // Two independent axes, kept explicit on purpose:
  // - `isMobile` (native AND narrow) drives the composer's own layout: two rows with an
  //   expand affordance, animated input height, input min-height.
  // - `isMobileSize` (narrow, any platform) drives column sizing: max width and the
  //   bottom gap of the centered column.
  // Mixing the two is what made mobile web inherit a native-only expand button.
  const composerRowsHeight = isMobile
    ? MIN_COMPOSER_HEIGHT + getSpacing('x2') + COMPOSER_ACTIONS_HEIGHT
    : COMPOSER_ACTIONS_HEIGHT
  const composerBottomGap = isMobileSize
    ? (insets.bottom ?? getSpacing('x4'))
    : getSpacing('x4') * 2
  const composerBaselineHeight = getSpacing('x4') + composerRowsHeight + composerBottomGap

  return StyleSheet.create({
    root: {
      flex: 1,
      overflow: 'visible',
      backgroundColor: getColor('fill/background/secondary'),
    },
    column: {
      flex: 1,
      width: '100%',
      overflow: 'visible',
    },
    listWrapper: {
      flex: 1,
      width: '100%',
      overflow: 'visible',
    },
    list: {
      flex: 1,
      width: '100%',
    },
    listContent: {
      paddingTop: getSpacing('x6'),
      paddingBottom: composerBaselineHeight + getSpacing('x4'),
    },
    listItem: {
      width: '100%',
    },
    listItemSeparator: {
      height: getSpacing('x4'),
    },
    composerFloatingWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      alignItems: 'center',
    },
    messageRowUser: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    messageRowAssistant: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    userBubble: {
      maxWidth: MAX_BUBBLE_WIDTH,
      flexShrink: 1,
      paddingHorizontal: getSpacing('x6'),
      paddingVertical: getSpacing('x4'),
      backgroundColor: getColor('fill/active/primary'),
    },
    userBubbleText: {
      color: getColor('brand/white'),
      maxWidth: '100%',
    },
    assistantContent: {
      maxWidth: MAX_BUBBLE_WIDTH,
      flexShrink: 1,
      gap: getSpacing('x2'),
    },
    imageBubbleImage: {
      width: 200,
      height: 200,
      borderRadius: theme.getRadius('medium'),
    },
    typingRow: {
      flexDirection: 'row',
      gap: getSpacing('x2'),
      paddingVertical: getSpacing('x2'),
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: getColor('icon/inactive/primary'),
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      flexWrap: 'wrap',
    },
    errorText: {
      color: getColor('text/alert/primary'),
    },
    retryLink: {
      color: getColor('text/info/primary'),
    },

    emptyState: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: getSpacing('x6'),
      paddingHorizontal: getSpacing('x6'),
      paddingBottom: composerBaselineHeight + getSpacing('x4'),
    },
    emptyTitle: {
      textAlign: 'center',
    },
    suggestionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: getSpacing('x3'),
    },

    interactiveCard: {
      maxWidth: MAX_BUBBLE_WIDTH,
      flexShrink: 1,
      padding: getSpacing('x6'),
      gap: getSpacing('x4'),
      backgroundColor: getColor('fill/background/primary'),
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getSpacing('x3'),
    },
    resolvedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x2'),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: getSpacing('x4'),
    },
    summaryList: {
      gap: getSpacing('x2'),
    },
    confirmationButtonsRow: {
      flexDirection: 'row',
      gap: getSpacing('x3'),
    },
    formFieldsGap: {
      gap: getSpacing('x4'),
    },
    submittedValuesList: {
      gap: getSpacing('x2'),
    },
    resultActionsColumn: {
      gap: getSpacing('x3'),
    },

    unknownCard: {
      maxWidth: MAX_BUBBLE_WIDTH,
      padding: getSpacing('x4'),
      backgroundColor: getColor('fill/background/primary'),
    },

    composerRoot: {
      width: '100%',
      ...(!isMobileSize ? { maxWidth: MAX_CHAT_WIDTH } : null),
      padding: getSpacing('x4'),
      backgroundColor: getColor('fill/background/primary'),
      borderTopLeftRadius: theme.getRadius('large'),
      borderTopRightRadius: theme.getRadius('large'),
      marginBottom: !isMobileSize ? getSpacing('x4') : 0,
    },
    composerBody: {
      gap: getSpacing('x2'),
    },
    composerWebRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: getSpacing('x2'),
    },
    composerWebInputSlot: {
      flex: 1,
      minWidth: 0,
    },
    composerInputWrap: {
      flexDirection: 'row',
      // Native stretches so the field fills the (possibly expanded) input area and the
      // whole area stays tappable; web centers the single-row input against the buttons.
      alignItems: isWeb ? 'center' : 'stretch',
      justifyContent: 'center',
      width: '100%',
      minHeight: isMobile ? undefined : COMPOSER_ACTIONS_HEIGHT,
      // Grow into the animated floor when expanded, but keep an intrinsic (content)
      // basis so the area still sizes itself to the text when it is not expanded.
      ...(isWeb ? null : { flexGrow: 1, flexBasis: 'auto' as const }),
    },
    composerInput: {
      flex: 1,
      minWidth: 100,
      fontSize: 16,
      lineHeight: COMPOSER_INPUT_LINE_HEIGHT,
      padding: 0,
      margin: 0,
      color: getColor('text/active/primary'),
      textAlignVertical: isWeb ? 'center' : 'top',
      ...(isWeb
        ? ({
            outlineStyle: 'none',
            outlineWidth: 0,
            resize: 'none',
          } as unknown as TextStyle)
        : null),
    },
    composerActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    composerActionsSpacer: {
      flex: 1,
    },
    composerIconButton: {
      padding: getSpacing('x1'),
    },
    expandButton: {
      width: COMPOSER_ACTIONS_HEIGHT,
      height: COMPOSER_ACTIONS_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonBase: {
      width: COMPOSER_ACTIONS_HEIGHT,
      height: COMPOSER_ACTIONS_HEIGHT,
      borderRadius: theme.getRadius('full'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonActiveFill: {
      backgroundColor: getColor('fill/inactive/primary'),
    },
    sendButtonInactiveFill: {
      backgroundColor: getColor('fill/inactive/secondary'),
    },
    sourceSheetBody: {
      gap: getSpacing('x3'),
    },
  })
}
