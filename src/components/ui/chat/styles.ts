import { StyleSheet, type TextStyle } from 'react-native'

import { isWeb } from '@/constants/dimensions'
import type { ThemeType } from '@/theme/theme-context'

const MAX_BUBBLE_WIDTH = '82%'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing, getColor, insets } = theme

  const composerBaselineHeight =
    getSpacing('x5') + getSpacing('x3') + (insets.bottom ?? 0) + 24 + getSpacing('x2') + 40

  return StyleSheet.create({
    root: {
      flex: 1,
      overflow: 'visible',
      backgroundColor: getColor('fill/background/secondary'),
    },
    listWrapper: {
      flex: 1,
      overflow: 'visible',
    },
    contentArea: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: getSpacing('x6'),
      paddingTop: getSpacing('x6'),
      paddingBottom: composerBaselineHeight + getSpacing('x4'),
      gap: getSpacing('x6'),
    },
    composerFloatingWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
    messageRowUser: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    messageRowAssistant: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    userBubble: {
      maxWidth: MAX_BUBBLE_WIDTH,
      paddingHorizontal: getSpacing('x6'),
      paddingVertical: getSpacing('x4'),
      backgroundColor: getColor('fill/active/primary'),
    },
    userBubbleText: {
      color: getColor('brand/white'),
    },
    assistantContent: {
      maxWidth: MAX_BUBBLE_WIDTH,
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
      alignItems: 'center',
      justifyContent: 'center',
      gap: getSpacing('x6'),
      paddingHorizontal: getSpacing('x8'),
      paddingBottom: composerBaselineHeight,
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
      padding: getSpacing('x6'),
      gap: getSpacing('x4'),
      backgroundColor: getColor('fill/background/primary'),
    },
    cardPrompt: {},
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
    actionButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x2'),
    },

    unknownCard: {
      maxWidth: MAX_BUBBLE_WIDTH,
      padding: getSpacing('x4'),
      backgroundColor: getColor('fill/background/primary'),
    },

    composerRoot: {
      paddingHorizontal: getSpacing('x6'),
      paddingTop: getSpacing('x5'),
      backgroundColor: getColor('fill/background/primary'),
      borderTopLeftRadius: theme.getRadius('large'),
      borderTopRightRadius: theme.getRadius('large'),
    },
    composerBody: {
      gap: getSpacing('x2'),
    },
    composerInputArea: {
      position: 'relative',
    },
    composerInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    composerInput: {
      flex: 1,
      minWidth: 100,
      fontSize: 16,
      padding: 0,
      margin: 0,
      color: getColor('text/active/primary'),
      textAlignVertical: 'top',
      ...(isWeb ? ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as TextStyle) : null),
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
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonBase: {
      width: 40,
      height: 40,
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
