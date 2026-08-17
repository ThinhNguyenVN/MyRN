import { StyleSheet } from 'react-native'
import { FadeIn, FadeOut } from 'react-native-reanimated'

import type { ThemeType } from '@/theme/theme-context'

export const ORDER_LINE_NOTE_ENTER_MS = 180
export const ORDER_LINE_NOTE_EXIT_MS = 120

export const orderLineNoteEntering = FadeIn.duration(ORDER_LINE_NOTE_ENTER_MS)
export const orderLineNoteExiting = FadeOut.duration(ORDER_LINE_NOTE_EXIT_MS)

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme
  return StyleSheet.create({
    tableRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: getSpacing('x3'),
      width: '100%',
    },
    colProduct: { flex: 2.2, minWidth: 220 },
    productFieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: getSpacing('x3'),
    },
    productFieldRowCompact: {
      alignItems: 'center',
    },
    productFieldRowLabeled: {
      alignItems: 'flex-end',
    },
    productFieldControl: {
      flex: 1,
      minWidth: 0,
    },
    productThumb: {
      width: 40,
      height: 40,
      borderRadius: getRadius('small'),
      overflow: 'hidden',
      alignSelf: 'flex-start',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
      backgroundColor: getColor('fill/background/secondary'),
    },
    productThumbPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: getRadius('small'),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('fill/background/secondary'),
    },
    colUnit: { flex: 1, minWidth: 120 },
    colQty: { width: 112, flexGrow: 0, flexShrink: 0 },
    colPrice: { width: 140, flexGrow: 0, flexShrink: 0 },
    colTotal: {
      width: 120,
      flexGrow: 0,
      flexShrink: 0,
      justifyContent: 'center',
      paddingTop: getSpacing('x2'),
    },
    colDelete: {
      width: 44,
      flexGrow: 0,
      flexShrink: 0,
      alignItems: 'flex-end',
      paddingTop: getSpacing('x1'),
    },
    mobileLineCard: {
      gap: getSpacing('x3'),
      padding: getSpacing('x4'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
      borderRadius: getRadius('large'),
      backgroundColor: getColor('fill/background/secondary'),
    },
    mobileProductBlock: {
      width: '100%',
      gap: getSpacing('x2'),
    },
    mobileLineTotalRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    mobileLineTotalValue: {
      marginLeft: 'auto',
    },
    mobileFieldRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: getSpacing('x3'),
      width: '100%',
    },
    mobileFieldHalf: {
      flex: 1,
      minWidth: 0,
    },
    mobileNumericInput: {
      textAlign: 'right',
    },
    mobilePriceInputRow: {
      backgroundColor: getColor('fill/background/secondary'),
    },
    lineBlock: {
      gap: getSpacing('x2'),
      paddingVertical: getSpacing('x3'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/quaternary'),
    },
    lineBlockLast: {
      borderBottomWidth: 0,
    },
    lineTotal: {
      color: getColor('brand/primary'),
    },
    fieldFullInput: {
      width: '100%',
      maxWidth: '100%',
    },
    lineNoteField: {
      gap: getSpacing('x2'),
      width: '100%',
      overflow: 'hidden',
    },
    lineNoteLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x1'),
      alignSelf: 'flex-start',
    },
    lineNoteLinkText: {
      color: getColor('brand/primary'),
    },
    lineNotePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x1'),
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    lineNotePreviewText: {
      flexShrink: 1,
      color: getColor('text/active/secondary'),
    },
  })
}
