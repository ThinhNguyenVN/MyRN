import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme

  return StyleSheet.create({
    section: {
      paddingVertical: 80,
      paddingHorizontal: getSpacing('x6'),
      backgroundColor: getColor('fill/background/primary'),
    },
    sectionMobile: {
      paddingVertical: getSpacing('x14'),
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: getColor('text/active/primary'),
      textAlign: 'center',
      marginBottom: getSpacing('x12'),
    },
    carouselContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: 900,
      alignSelf: 'center',
      width: '100%',
      gap: getSpacing('x6'),
    },
    navArrow: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: getColor('fill/background/tertiary'),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navArrowText: {
      fontSize: 24,
      color: getColor('text/active/secondary'),
    },
    card: {
      flex: 1,
      alignItems: 'center',
      gap: getSpacing('x3'),
      paddingHorizontal: getSpacing('x12'),
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: getSpacing('x2'),
    },
    quoteIcon: {
      fontSize: 36,
      color: getColor('border/inactive/primary'),
    },
    content: {
      fontSize: 18,
      lineHeight: 28,
      color: getColor('text/active/secondary'),
      textAlign: 'center',
      fontStyle: 'italic',
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
      color: getColor('text/active/primary'),
      marginTop: getSpacing('x2'),
    },
    company: {
      fontSize: 14,
      color: getColor('text/active/tertiary'),
    },
    dots: {
      marginTop: getSpacing('x8'),
    },
  })
}
