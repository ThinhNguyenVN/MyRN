import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    // ─── Playground index ───────────────────────────────────────────────────
    playgroundHeaderImage: {
      alignSelf: 'center',
    },
    playgroundContent: {
      paddingHorizontal: getSpacing('x4'),
      paddingBottom: getSpacing('x6'),
      alignSelf: 'stretch',
      width: '100%',
    },
    playgroundTitle: {
      marginTop: getSpacing('x6'),
      marginBottom: getSpacing('x2'),
    },
    playgroundSubtitle: {
      marginBottom: getSpacing('x4'),
    },
    linkListContent: {
      paddingBottom: getSpacing('x6'),
      alignSelf: 'stretch',
      width: '100%',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: getSpacing('x3'),
      paddingHorizontal: getSpacing('x2'),
      marginBottom: getSpacing('x1'),
      borderRadius: 10,
      backgroundColor: getColor('fill/background/secondary'),
      alignSelf: 'stretch',
      width: '100%',
    },
    linkRowLabel: {
      flex: 1,
      flexGrow: 1,
      minWidth: 0,
    },
    linkRowArrow: {
      flexShrink: 0,
    },

    // ─── Shared (other tabs / playground buttons) ───────────────────────────
    titleContainer: {
      alignItems: 'center',
      gap: getSpacing('x2'),
    },
    stepContainer: {
      gap: getSpacing('x2'),
      marginBottom: getSpacing('x2'),
      backgroundColor: getColor('fill/active/primary'),
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
    sectionTitle: {
      marginTop: getSpacing('x6'),
      marginBottom: getSpacing('x2'),
    },
    introText: {
      marginBottom: getSpacing('x4'),
      textAlign: 'center',
    },
    introButton: {
      width: '100%',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: getSpacing('x4'),
      alignSelf: 'stretch',
    },
    buttonMargin: {
      marginBottom: getSpacing('x2'),
    },
    inputContainer: {
      marginBottom: getSpacing('x3'),
      alignSelf: 'stretch',
    },
    redButton: {
      backgroundColor: 'red',
    },
    screenContent: {
      paddingHorizontal: getSpacing('x4'),
      paddingBottom: getSpacing('x6'),
      gap: getSpacing('x4'),
    },
    buttonContainer: {
      gap: getSpacing('x4'),
      alignItems: 'center',
    },
  })
}
