import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing } = theme
  return StyleSheet.create({
    sideBarContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    contentContainer: {
      flex: 1,
      marginLeft: 16,
    },
    sectionTitle: {
      marginTop: 24,
      marginBottom: 8,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 18,
      alignSelf: 'stretch',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
      marginBottom: getSpacing('x4'),
    },
    buttonMargin: {
      marginBottom: 8,
    },
    inputContainer: {
      marginBottom: 12,
      alignSelf: 'stretch',
    },
    screenContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: getSpacing('x4'),
    },
    sheetContent: {
      gap: 8,
    },
    labelMargin: {
      marginBottom: 8,
    },
    alertMargin: {
      marginBottom: 16,
    },
    sectionCaption: {
      marginBottom: 12,
    },
    introText: {
      marginBottom: 12,
    },
    smallImage: {
      width: 100,
      height: 100,
      alignSelf: 'center',
    },
    smallImageMargin: {
      width: 100,
      height: 100,
      alignSelf: 'center',
      marginBottom: 16,
    },
    image200x120: {
      width: 200,
      height: 120,
      alignSelf: 'center',
      marginBottom: 16,
    },
    image200x100: {
      width: 200,
      height: 100,
      alignSelf: 'center',
      marginBottom: 16,
    },
    image180x100: {
      width: 180,
      height: 100,
      alignSelf: 'center',
      marginBottom: 16,
    },
    image150x150: {
      width: 150,
      height: 150,
      alignSelf: 'center',
      marginBottom: 16,
    },
    errorContent: {
      padding: 16,
      alignItems: 'center',
      gap: 4,
    },
  })
}
