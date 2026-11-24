import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

import { PLAN_CARD_RADIUS } from './constants'

export function generatePricingPlanCardStyles(theme: ThemeType) {
  const { getColor, getSpacing, isMobileSize } = theme
  const pad = getSpacing(isMobileSize ? 'x5' : 'x8')

  return StyleSheet.create({
    root: {
      flex: isMobileSize ? undefined : 1,
      borderRadius: PLAN_CARD_RADIUS,
    },
    /** Halo behind the card; its opacity follows the hover. */
    glow: {
      ...StyleSheet.absoluteFill,
      borderRadius: PLAN_CARD_RADIUS,
    },
    shadowBasic: {
      boxShadow: '0 10px 30px -22px rgba(25, 28, 30, 0.35)',
    },
    glowBasic: {
      boxShadow: '0 22px 48px -22px rgba(25, 28, 30, 0.35)',
    },
    card: {
      flex: isMobileSize ? undefined : 1,
      borderRadius: PLAN_CARD_RADIUS,
      overflow: 'hidden',
      padding: pad,
      gap: getSpacing('x5'),
    },
    cardBasic: {
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/quaternary'),
    },
    cardSelected: {
      borderWidth: 2,
      borderColor: getColor('fill/active/primary'),
    },
    cardFeatured: {
      borderWidth: 1,
    },
    cardFeaturedSelected: {
      borderWidth: 2,
    },
    fill: {
      ...StyleSheet.absoluteFill,
    },
    orb: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 130,
      top: -120,
      right: -90,
    },
    orbSmall: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      bottom: -70,
      left: -50,
    },
    shine: {
      position: 'absolute',
      top: -40,
      bottom: -40,
      width: 140,
    },
    shineFill: {
      flex: 1,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x2'),
      minHeight: isMobileSize ? 0 : 26,
      marginBottom: -getSpacing('x2'),
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: getSpacing('x3'),
      borderRadius: 999,
    },
    pillBasic: {
      backgroundColor: getColor('border/info/tertiary'),
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBadgeBasic: {
      backgroundColor: getColor('border/info/tertiary'),
    },
    iconBadgeFeatured: {
      borderWidth: 1,
    },
    headText: {
      flex: 1,
      gap: 2,
    },
    tagline: {
      // Two lines kept on desktop so prices of cards side by side start at the same height.
      minHeight: isMobileSize ? 0 : 32,
    },
    priceBlock: {
      gap: getSpacing('x1'),
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: getSpacing('x1'),
    },
    price: {
      fontSize: isMobileSize ? 36 : 44,
      lineHeight: isMobileSize ? 42 : 50,
      fontWeight: '800',
      letterSpacing: -1,
    },
    pricePeriod: {
      marginBottom: 8,
    },
    savingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
      // Same height in every card on desktop so prices and buttons line up.
      minHeight: isMobileSize ? 0 : 24,
    },
    strike: {
      textDecorationLine: 'line-through',
    },
    savingChip: {
      paddingVertical: 2,
      paddingHorizontal: getSpacing('x2'),
      borderRadius: 999,
    },
    savingChipBasic: {
      backgroundColor: getColor('border/success/secondary'),
    },
    savingChipFeatured: {
      backgroundColor: getColor('fill/success/primary'),
    },
    cta: {
      height: 48,
      borderRadius: 14,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: getSpacing('x2'),
    },
    ctaBasic: {
      borderWidth: 1.5,
      borderColor: getColor('brand/primary'),
    },
    divider: {
      height: 1,
    },
    dividerBasic: {
      backgroundColor: getColor('border/inactive/quaternary'),
    },
    features: {
      gap: getSpacing('x3'),
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
    },
    featureText: {
      flex: 1,
    },
  })
}
