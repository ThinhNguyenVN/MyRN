import { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
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
      marginTop: 24,
      marginBottom: 8,
    },
    introText: {
      marginBottom: getSpacing('x4'),
      textAlign: 'center',
    },
    introButton: {
      marginTop: getSpacing('x2'),
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 18,
      alignSelf: 'stretch',
    },
    buttonMargin: {
      marginBottom: 8,
    },
    inputContainer: {
      marginBottom: 12,
      alignSelf: 'stretch',
    },
    redButton: {
      backgroundColor: 'red',
    },
    playgroundHeaderImage: {
      alignSelf: 'center',
    },
    playgroundContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      alignSelf: 'stretch',
      width: '100%',
    },
    playgroundTitle: {
      marginTop: 24,
      marginBottom: 8,
    },
    playgroundSubtitle: {
      marginBottom: 16,
    },
    linkListContent: {
      paddingBottom: 24,
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
  })
}
