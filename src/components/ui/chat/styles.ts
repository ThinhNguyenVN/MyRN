import { StyleSheet, type TextStyle } from 'react-native'

import { isMobileSize, isWeb, MAX_CHAT_WIDTH } from '@/constants/dimensions'
import { Spacing } from '@/theme/spacing'
import type { ThemeType } from '@/theme/theme-context'

import {
  ATTACHMENT_THUMBNAIL_SIZE,
  COMPOSER_ACTIONS_HEIGHT,
  COMPOSER_INPUT_LINE_HEIGHT,
  MIN_COMPOSER_HEIGHT,
} from './constants'

export function getChatColumnGutter(
  columnWidth: number,
  isMobileSize: boolean,
  spacing: number,
): number {
  if (isMobileSize) {
    return spacing
  }
  if (columnWidth <= MAX_CHAT_WIDTH) {
    return 0
  }
  return (columnWidth - MAX_CHAT_WIDTH) / 2
}

const MAX_BUBBLE_WIDTH = '100%'
const MIN_BUBBLE_WIDTH = isMobileSize ? '70%' : '50%'
/** Single-image photo card side, in px. */
const PHOTO_CARD_SIZE = 220
/** Fixed thumbnail side for each photo in a multi-image row, in px. */
const PHOTO_THUMB_SIZE = 100
/** Photos per row before wrapping — a fixed pixel row width (not `maxWidth`-driven shrink-wrap,
 *  which left a trailing gap: the card stretched to its cross-axis rather than hugging content). */
const PHOTO_GRID_COLUMNS = 3

/**
 * Pixel width for a photo grid holding `imageCount` images — exactly wide enough for
 * `min(imageCount, PHOTO_GRID_COLUMNS)` thumbnails, so a message with fewer photos than
 * `PHOTO_GRID_COLUMNS` (e.g. 2) gets a card sized to just those photos, not a reserved
 * 3-wide slot with empty space trailing off to the right.
 */
export function getPhotoGridWidth(imageCount: number): number {
  const columns = Math.max(1, Math.min(imageCount, PHOTO_GRID_COLUMNS))
  return columns * PHOTO_THUMB_SIZE + (columns - 1) * Spacing.x1
}

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
    // Android keyboard shift: clips the list while the counter-transform is unwinding so
    // the shifted content cannot draw over the header.
    keyboardShiftWrapper: {
      flex: 1,
      width: '100%',
      overflow: 'hidden',
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
      alignSelf: 'flex-end',
      maxWidth: MAX_BUBBLE_WIDTH,
      flexGrow: 0,
      flexShrink: 1,
      padding: getSpacing('x3'),
      // No effect on single-child bubbles (plain text) — only spaces image from caption.
      gap: getSpacing('x2'),
      backgroundColor: getColor('fill/active/primary'),
      borderTopLeftRadius: theme.getRadius('large'),
      borderTopRightRadius: theme.getRadius('small'),
      borderBottomLeftRadius: theme.getRadius('large'),
      borderBottomRightRadius: theme.getRadius('large'),
      overflow: 'hidden',
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
    // Photos render on a neutral card (own background + soft shadow via MySurface's default
    // elevation), never tinted with the brand fill — a solid color field behind a grid of
    // photos (especially a light/white one) reads as dated, not as a "sent" indicator like it
    // does for plain text. The sent/received signal lives in the caption pill below instead.
    userImageColumn: {
      maxWidth: MAX_BUBBLE_WIDTH,
      width: '100%',
      alignItems: 'flex-end',
      gap: getSpacing('x1'),
    },
    photoCard: {
      // MySurface fills the cross-axis space it's given rather than hugging its content, so
      // without this the card stretched to `userImageColumn`'s full width regardless of how
      // narrow the actual photo grid was — explicit alignSelf forces it back to content width.
      alignSelf: 'flex-end',
      maxWidth: MAX_BUBBLE_WIDTH,
      overflow: 'hidden',
      backgroundColor: getColor('fill/background/primary'),
    },
    photoSingle: {
      width: PHOTO_CARD_SIZE,
      height: PHOTO_CARD_SIZE,
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      // No fixed/max width here — the caller sets an exact pixel `width` per message via
      // `getPhotoGridWidth(message.imageUris.length)` so a 2-photo message gets a card sized
      // to exactly 2 thumbnails, not a reserved PHOTO_GRID_COLUMNS-wide slot with a gap
      // trailing off to the right. `maxWidth`/shrink-wrap here left the card stretched to the
      // bubble's cross-axis width instead (MySurface fills the space it's given).
      gap: getSpacing('x1'),
    },
    photoGridCell: {
      width: PHOTO_THUMB_SIZE,
      height: PHOTO_THUMB_SIZE,
    },
    typingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x2'),
      // Match one body line so the list doesn't jump when streaming starts.
      minHeight: COMPOSER_INPUT_LINE_HEIGHT,
      paddingVertical: getSpacing('x1'),
    },
    typingDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
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
      minWidth: MIN_BUBBLE_WIDTH,
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

    attachmentPreviewRow: {
      // Fixed, not flexGrow, so it never fights the animated composerBody for space.
      flexGrow: 0,
      marginBottom: getSpacing('x2'),
    },
    attachmentPreviewContent: {
      flexDirection: 'row',
      gap: getSpacing('x2'),
    },
    attachmentThumbWrap: {
      width: ATTACHMENT_THUMBNAIL_SIZE,
      height: ATTACHMENT_THUMBNAIL_SIZE,
    },
    attachmentThumb: {
      width: ATTACHMENT_THUMBNAIL_SIZE,
      height: ATTACHMENT_THUMBNAIL_SIZE,
      borderRadius: theme.getRadius('medium'),
    },
    attachmentRemoveBadge: {
      position: 'absolute',
      // Inset (not overhanging the corner) so it can never get clipped by the preview
      // ScrollView's bounds, on any platform.
      top: 3,
      right: 3,
      width: 18,
      height: 18,
      borderRadius: theme.getRadius('full'),
      alignItems: 'center',
      justifyContent: 'center',
      // theme-exempt: dark translucent photo-chrome, same in both themes (like a native
      // photo picker's remove badge) — not a themed surface color.
      backgroundColor: 'rgba(17, 17, 17, 0.55)',
    },
    attachmentAddTile: {
      width: ATTACHMENT_THUMBNAIL_SIZE,
      height: ATTACHMENT_THUMBNAIL_SIZE,
      borderRadius: theme.getRadius('medium'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/tertiary'),
      backgroundColor: getColor('fill/background/secondary'),
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}
