import { MAX_INPUT_WIDTH } from '@/constants/dimensions'
import { SIDEBAR_WIDTH } from '@/components/ui/side-bar/styles'
import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing, insets, getColor } = theme

  return StyleSheet.create({
    sideBarContainer: {
      flex: 1,
      backgroundColor: getColor('brand/white'),
    },
    contentContainer: {
      flex: 1,
      paddingLeft: SIDEBAR_WIDTH + getSpacing('x2'),
    },
    sidebarWrapper: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      zIndex: 2,
    },
    screenContent: {
      padding: getSpacing('x4'),
      paddingBottom: (insets.bottom ?? 0) + 100,
      gap: getSpacing('x4'),
      backgroundColor: getColor('brand/white'),
    },

    // ─── Section titles & labels ───────────────────────────────────────────
    sectionTitle: {
      marginTop: getSpacing('x6'),
      marginBottom: getSpacing('x2'),
    },
    sectionCaption: {
      marginBottom: getSpacing('x3'),
    },
    labelMargin: {
      marginBottom: getSpacing('x2'),
    },
    introText: {
      marginBottom: getSpacing('x3'),
    },

    // ─── Content blocks ────────────────────────────────────────────────────
    content: {
      gap: getSpacing('x4'),
    },
    inputContainer: {
      gap: getSpacing('x2'),
    },
    alertMargin: {
      marginBottom: getSpacing('x4'),
    },

    // ─── Buttons & chips ───────────────────────────────────────────────────
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: getSpacing('x4'),
    },
    buttonMargin: {
      marginBottom: getSpacing('x2'),
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
      marginBottom: getSpacing('x4'),
    },

    // ─── Bottom sheet ──────────────────────────────────────────────────────
    bottomsheet: {
      gap: getSpacing('x4'),
    },
    sheetContent: {
      gap: getSpacing('x2'),
      // justifyContent: 'center',
      // alignItems: 'center',
    },

    // ─── Images ─────────────────────────────────────────────────────────────
    smallImage: {
      width: 100,
      height: 100,
      alignSelf: 'center',
    },
    smallImageMargin: {
      width: 100,
      height: 100,
      alignSelf: 'center',
      marginBottom: getSpacing('x4'),
    },
    image150x150: {
      width: 150,
      height: 150,
      alignSelf: 'center',
      marginBottom: getSpacing('x4'),
    },
    image180x100: {
      width: 180,
      height: 100,
      alignSelf: 'center',
      marginBottom: getSpacing('x4'),
    },
    image200x100: {
      width: 200,
      height: 100,
      alignSelf: 'center',
      marginBottom: getSpacing('x4'),
    },
    image200x120: {
      width: 200,
      height: 120,
      alignSelf: 'center',
      marginBottom: getSpacing('x4'),
    },

    // ─── Misc ───────────────────────────────────────────────────────────────
    errorContent: {
      padding: getSpacing('x4'),
      alignItems: 'center',
      gap: getSpacing('x1'),
    },

    bottomsheetContent: {
      gap: getSpacing('x2'),
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 100,
    },
    sheetRadioStretch: {
      flex: 1,
    },
  })
}

export const formScreenStyles = (theme: ThemeType) => {
  const { getSpacing, insets, getColor, isMobileSize } = theme
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: getColor('brand/white'),
    },
    formContainer: {
      gap: getSpacing('x2'),
    },
    formContent: {
      maxWidth: isMobileSize ? '100%' : MAX_INPUT_WIDTH,
    },
    formTitle: {
      marginBottom: getSpacing('x4'),
    },
    content: {
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x4'),
      paddingBottom: (insets.bottom ?? 0) + 100,
      gap: getSpacing('x4'),
    },
    field: {
      marginBottom: getSpacing('x4'),
      gap: getSpacing('x2'),
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
      marginBottom: getSpacing('x4'),
    },
    submitBtn: {
      marginTop: getSpacing('x2'),
    },
  })
}
