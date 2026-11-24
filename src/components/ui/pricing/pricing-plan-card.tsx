import { memo, useCallback, useMemo, useState } from 'react'
import { Pressable, type LayoutChangeEvent } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import MyIcon from '@/components/elements/my-icon'
import type { MyIconProps } from '@/components/elements/my-icon/type'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { featuredPaletteOf, PRICING_SHINE, type FeaturedPalette } from './constants'
import { generatePricingPlanCardStyles } from './pricing-plan-card.styles'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const HOVER_SPRING = { damping: 16, stiffness: 180, mass: 0.6 }
const SHINE_MS = 900

export type PricingPlanCardProps = {
  name: string
  /** One line under the name; two lines are kept on desktop so cards line up. */
  tagline?: string
  icon?: MyIconProps['name']
  /** Already formatted, e.g. `399.000đ`. */
  price: string
  /** After the price, e.g. `/ tháng`. */
  pricePeriod?: string
  /** Undiscounted price, struck through. */
  strikePrice?: string
  /** Saving chip, e.g. `Tiết kiệm 17%`. */
  saving?: string
  /** Small caption after the saving, e.g. `≈ 332.500đ / tháng`. */
  priceNote?: string
  /** Label above the feature list, e.g. `Bao gồm`. */
  featuresTitle?: string
  features: string[]
  /** Ribbon of the featured card, e.g. `Khuyên dùng`. */
  ribbon?: string
  /** Pill for the plan in use, e.g. `Đang dùng`. */
  currentLabel?: string
  /** Without it the card has no button and does not press. */
  ctaLabel?: string
  onPress?: () => void
  /** Gradient card with the accent colour and the stronger hover. */
  featured?: boolean
  selected?: boolean
  /** Brand of the featured card; missing keys use the default navy + amber. */
  palette?: Partial<FeaturedPalette>
  testID?: string
}

/**
 * One plan of a price list. Hover (web): the card lifts, its halo shows, and a featured card
 * also gets a light sweep; press shrinks it a little. No motion when the OS asks for less.
 */
function PricingPlanCardInner({
  name,
  tagline,
  icon,
  price,
  pricePeriod,
  strikePrice,
  saving,
  priceNote,
  featuresTitle,
  features,
  ribbon,
  currentLabel,
  ctaLabel,
  onPress,
  featured = false,
  selected = false,
  palette,
  testID,
}: PricingPlanCardProps) {
  const styles = useThemedStyles(generatePricingPlanCardStyles)
  const { getColor } = useTheme()
  const colors = useMemo(() => featuredPaletteOf(palette), [palette])
  const reduceMotion = useReducedMotion()
  const hover = useSharedValue(0)
  const press = useSharedValue(0)
  const shine = useSharedValue(0)
  const [width, setWidth] = useState(0)

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  const handleHoverIn = useCallback(() => {
    if (reduceMotion) return
    hover.value = withSpring(1, HOVER_SPRING)
    if (featured) {
      shine.value = 0
      shine.value = withTiming(1, { duration: SHINE_MS, easing: Easing.out(Easing.cubic) })
    }
  }, [featured, hover, reduceMotion, shine])

  const handleHoverOut = useCallback(() => {
    hover.value = withSpring(0, HOVER_SPRING)
  }, [hover])

  const handlePressIn = useCallback(() => {
    if (!reduceMotion) press.value = withTiming(1, { duration: 90 })
  }, [press, reduceMotion])

  const handlePressOut = useCallback(() => {
    press.value = withTiming(0, { duration: 160 })
  }, [press])

  const liftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(hover.value, [0, 1], [0, featured ? -10 : -6]) },
      {
        scale:
          interpolate(hover.value, [0, 1], [1, featured ? 1.025 : 1.012]) -
          interpolate(press.value, [0, 1], [0, 0.015]),
      },
    ],
  }))
  const glowStyle = useAnimatedStyle(() => ({ opacity: hover.value }))
  const shineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shine.value, [0, 0.1, 0.85, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: interpolate(shine.value, [0, 1], [-180, width + 40]) },
      { rotate: '18deg' },
    ],
  }))

  const ink = featured ? { color: colors.ink } : undefined
  const mutedInk = featured ? { color: colors.mutedInk } : undefined
  const accent = featured ? colors.accent : getColor('brand/primary')
  const canPress = Boolean(ctaLabel && onPress)

  return (
    <AnimatedPressable
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={canPress ? onPress : undefined}
      onLayout={handleLayout}
      accessibilityRole={canPress ? 'button' : undefined}
      accessibilityLabel={canPress ? ctaLabel : name}
      accessibilityState={canPress ? { selected } : undefined}
      style={[
        styles.root,
        featured ? { boxShadow: `0 24px 50px -24px ${colors.glow}` } : styles.shadowBasic,
        liftStyle,
      ]}
      testID={testID}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          featured ? { boxShadow: `0 32px 64px -20px ${colors.glow}` } : styles.glowBasic,
          glowStyle,
        ]}
      />
      <MyView
        style={[
          styles.card,
          featured ? [styles.cardFeatured, { borderColor: colors.overlay }] : styles.cardBasic,
          selected &&
            (featured
              ? [styles.cardFeaturedSelected, { borderColor: colors.accent }]
              : styles.cardSelected),
        ]}
      >
        {featured ? (
          <>
            <LinearGradient
              colors={[...colors.gradient] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fill}
            />
            <MyView pointerEvents="none" style={[styles.orb, { backgroundColor: colors.orb }]} />
            <MyView
              pointerEvents="none"
              style={[styles.orbSmall, { backgroundColor: colors.orbSecondary }]}
            />
            <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]}>
              <LinearGradient
                colors={[...PRICING_SHINE]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shineFill}
              />
            </Animated.View>
          </>
        ) : null}

        {/* Same-height badge row in every card keeps names, prices and buttons aligned. */}
        <MyView style={styles.badges}>
          {ribbon ? (
            <MyView style={[styles.pill, { backgroundColor: colors.accent }]} testID="plan-ribbon">
              <MyIcon name="star" size={12} color={colors.accentInk} />
              <MyText typography="label" style={{ color: colors.accentInk }}>
                {ribbon}
              </MyText>
            </MyView>
          ) : null}
          {currentLabel ? (
            <MyView
              style={[
                styles.pill,
                featured ? { backgroundColor: colors.overlay } : styles.pillBasic,
              ]}
            >
              <MyIcon
                name="checkmark-circle"
                size={12}
                color={featured ? colors.ink : getColor('brand/primary')}
              />
              <MyText
                typography="label"
                style={featured ? ink : { color: getColor('brand/primary') }}
              >
                {currentLabel}
              </MyText>
            </MyView>
          ) : null}
        </MyView>

        <MyView style={styles.head}>
          <MyView
            style={[
              styles.iconBadge,
              featured
                ? [
                    styles.iconBadgeFeatured,
                    { backgroundColor: colors.overlay, borderColor: colors.overlay },
                  ]
                : styles.iconBadgeBasic,
            ]}
          >
            <MyIcon
              name={icon ?? (featured ? 'diamond' : 'storefront-outline')}
              size={22}
              color={accent}
            />
          </MyView>
          <MyView style={styles.headText}>
            <MyText typography="h4" style={ink}>
              {name}
            </MyText>
            {tagline ? (
              <MyText
                typography="caption"
                color="text/active/secondary"
                style={[styles.tagline, mutedInk]}
                numberOfLines={2}
              >
                {tagline}
              </MyText>
            ) : null}
          </MyView>
        </MyView>

        <MyView style={styles.priceBlock}>
          <MyView style={styles.priceRow}>
            <MyText style={[styles.price, ink ?? { color: getColor('text/active/primary') }]}>
              {price}
            </MyText>
            {pricePeriod ? (
              <MyText
                typography="body"
                color="text/active/secondary"
                style={[styles.pricePeriod, mutedInk]}
              >
                {pricePeriod}
              </MyText>
            ) : null}
          </MyView>
          <MyView style={styles.savingRow}>
            {strikePrice ? (
              <MyText
                typography="caption"
                color="text/active/tertiary"
                style={[styles.strike, mutedInk]}
              >
                {strikePrice}
              </MyText>
            ) : null}
            {saving ? (
              <MyView
                style={[
                  styles.savingChip,
                  featured ? styles.savingChipFeatured : styles.savingChipBasic,
                ]}
              >
                <MyText
                  typography="label"
                  style={{
                    color: featured
                      ? getColor('text/contrast/dark')
                      : getColor('text/success/primary'),
                  }}
                >
                  {saving}
                </MyText>
              </MyView>
            ) : null}
            {priceNote ? (
              <MyText typography="caption" color="text/active/secondary" style={mutedInk}>
                {priceNote}
              </MyText>
            ) : null}
          </MyView>
        </MyView>

        {ctaLabel ? (
          // The featured card has the one solid button; the others stay outlined.
          <MyView style={[styles.cta, featured ? null : styles.ctaBasic]} testID="plan-cta">
            {featured ? (
              <LinearGradient
                colors={[...colors.cta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fill}
              />
            ) : null}
            <MyText
              typography="button"
              style={{ color: featured ? colors.accentInk : getColor('brand/primary') }}
            >
              {ctaLabel}
            </MyText>
            <MyIcon
              name="arrow-forward"
              size={16}
              color={featured ? colors.accentInk : getColor('brand/primary')}
            />
          </MyView>
        ) : null}

        <MyView
          style={[
            styles.divider,
            featured ? { backgroundColor: colors.overlay } : styles.dividerBasic,
          ]}
        />

        <MyView style={styles.features}>
          {featuresTitle ? (
            <MyText typography="label" color="text/active/secondary" style={mutedInk}>
              {featuresTitle}
            </MyText>
          ) : null}
          {features.map((feature) => (
            <MyView key={`plan-feature-${feature}`} style={styles.feature}>
              <MyIcon name="checkmark-circle" size={18} color={accent} />
              <MyText typography="body" style={[styles.featureText, ink]}>
                {feature}
              </MyText>
            </MyView>
          ))}
        </MyView>
      </MyView>
    </AnimatedPressable>
  )
}

export const PricingPlanCard = memo(PricingPlanCardInner)
