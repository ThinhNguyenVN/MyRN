import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing, getRadius } = theme
  return StyleSheet.create({
    // ─── Playground index ───────────────────────────────────────────────────
    playgroundHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: getSpacing('x10'),
      backgroundColor: getColor('fill/background/secondary'),
    },
    playgroundHeaderImage: {
      alignSelf: 'center',
    },
    playgroundContent: {
      paddingBottom: getSpacing('x10'),

      width: '100%',
    },
    playgroundTitle: {
      paddingVertical: getSpacing('x4'),
    },
    playgroundSubtitle: {
      marginBottom: getSpacing('x4'),
    },
    linkListContent: {
      paddingBottom: getSpacing('x10'),
      gap: getSpacing('x2'),
    },
    linkRow: {
      paddingVertical: getSpacing('x4'),
      paddingHorizontal: getSpacing('x4'),
      borderRadius: getRadius('medium'),
      backgroundColor: getColor('fill/background/secondary'),
    },

    // ─── Shared (other tabs / playground buttons) ───────────────────────────
    homeHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: getSpacing('x10'),
      backgroundColor: getColor('fill/background/secondary'),
    },
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
      height: 120,
      width: 196,
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
      paddingTop: getSpacing('x4'),
    },
  })
}
