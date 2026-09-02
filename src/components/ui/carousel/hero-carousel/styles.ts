import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme

  return StyleSheet.create({
    heroSection: {
      height: 740,
    },
    heroSectionMobile: {
      height: 460,
    },
    heroContent: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: getSpacing('x12'),
      paddingBottom: getSpacing('x14'),
      gap: getSpacing('x10'),
    },
    heroContentMobile: {
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x12'),
      paddingBottom: getSpacing('x8'),
      gap: getSpacing('x5'),
    },
    heroGlassPanel: {
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      borderRadius: 24,
      padding: getSpacing('x8'),
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      gap: getSpacing('x3'),
      maxWidth: 700,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 10,
    },
    heroTitle: {
      fontSize: 44,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    heroTitleMobile: {
      fontSize: 26,
    },
    heroSubtitle: {
      fontSize: 22,
      fontWeight: '600',
      color: getColor('brand/secondary'),
    },
    heroSubtitleMobile: {
      fontSize: 16,
    },
    heroFeaturesRow: {
      flexDirection: 'row',
      gap: getSpacing('x4'),
      maxWidth: 800,
      width: '100%',
    },
    heroFeaturesRowMobile: {
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
    },
    heroFeatureBadge: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      padding: getSpacing('x4'),
      alignItems: 'center',
      gap: getSpacing('x2'),
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 4,
    },
    heroFeatureBadgeMobile: {
      flexBasis: '45%',
      padding: getSpacing('x3'),
    },
    heroFeatureLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: getColor('brand/primary'),
      textAlign: 'center',
    },
    heroFeatureValue: {
      fontSize: 34,
      fontWeight: '800',
      color: getColor('brand/secondary'),
    },
    heroFeatureValueMobile: {
      fontSize: 26,
    },
    heroFeatureTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: getColor('text/active/primary'),
      textAlign: 'center',
    },
    heroFeatureTitleMobile: {
      fontSize: 14,
    },
    heroFeatureSubtitle: {
      fontSize: 12,
      fontWeight: '500',
      color: getColor('text/active/secondary'),
      textAlign: 'center',
    },
    heroFeatureSubtitleMobile: {
      fontSize: 11,
    },
    heroFeatureStep: {
      fontSize: 22,
      fontWeight: '800',
      color: getColor('brand/secondary'),
    },
    heroFeatureStepMobile: {
      fontSize: 18,
    },
    heroArrow: {
      position: 'absolute',
      top: '50%',
      marginTop: -getSpacing('x6'),
      zIndex: 50,
      width: getSpacing('x12'),
      height: getSpacing('x12'),
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroArrowPrev: {
      left: getSpacing('x4'),
    },
    heroArrowNext: {
      right: getSpacing('x4'),
    },
    heroArrowText: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: '300',
    },
    heroDots: {
      position: 'absolute',
      bottom: getSpacing('x3'),
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: getSpacing('x3'),
    },
    heroDot: {
      width: getSpacing('x12'),
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroDotActive: {
      backgroundColor: '#ffffff',
    },
    heroFeatureIcon: {
      color: getColor('brand/primary'),
    },
  })
}
