import React, { memo, useEffect, useRef } from 'react'
import { Animated, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import MyPressable from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import { CarouselDots } from '../carousel-dots'
import { generateStyles } from './styles'
import type { HeroCarouselProps } from './type'

const HeroCarouselInner: React.FC<HeroCarouselProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  onPrev,
  onNext,
  isMobileSize,
}) => {
  const styles = useThemedStyles(generateStyles)
  const slide = slides[currentSlide]

  const slideOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    slideOpacity.setValue(0)
    Animated.timing(slideOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start()
  }, [currentSlide, slideOpacity])

  if (!slide) return null

  return (
    <View style={[styles.heroSection, isMobileSize && styles.heroSectionMobile]}>
      <Animated.View
        style={[
          styles.heroContent,
          isMobileSize && styles.heroContentMobile,
          { opacity: slideOpacity },
        ]}
      >
        <View style={styles.heroGlassPanel}>
          <Text style={[styles.heroTitle, isMobileSize && styles.heroTitleMobile]}>
            {slide.title}
          </Text>
          <Text style={[styles.heroSubtitle, isMobileSize && styles.heroSubtitleMobile]}>
            {slide.subtitle}
          </Text>
        </View>

        <View style={[styles.heroFeaturesRow, isMobileSize && styles.heroFeaturesRowMobile]}>
          {slide.features.map((f) => (
            <View
              key={`feature-${f.kind}-${'label' in f ? f.label : f.title}`}
              style={[styles.heroFeatureBadge, isMobileSize && styles.heroFeatureBadgeMobile]}
            >
              {f.kind === 'badge' ? (
                <>
                  <Feather name={f.icon} size={22} color={styles.heroFeatureIcon.color} />
                  <Text style={styles.heroFeatureLabel}>{f.label}</Text>
                </>
              ) : f.kind === 'stat' ? (
                <>
                  <Text
                    style={[styles.heroFeatureValue, isMobileSize && styles.heroFeatureValueMobile]}
                  >
                    {f.value}
                  </Text>
                  <Text style={styles.heroFeatureLabel}>{f.label}</Text>
                </>
              ) : f.kind === 'service' ? (
                <>
                  <Text
                    style={[styles.heroFeatureTitle, isMobileSize && styles.heroFeatureTitleMobile]}
                  >
                    {f.title}
                  </Text>
                  <Text
                    style={[
                      styles.heroFeatureSubtitle,
                      isMobileSize && styles.heroFeatureSubtitleMobile,
                    ]}
                  >
                    {f.subtitle}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={[styles.heroFeatureStep, isMobileSize && styles.heroFeatureStepMobile]}
                  >
                    {f.step}
                  </Text>
                  <Text style={styles.heroFeatureLabel}>{f.label}</Text>
                </>
              )}
            </View>
          ))}
        </View>
      </Animated.View>

      <MyPressable
        style={[styles.heroArrow, styles.heroArrowPrev]}
        onPress={onPrev}
        accessibilityRole="button"
        accessibilityLabel="Previous slide"
      >
        <Text style={styles.heroArrowText}>{'‹'}</Text>
      </MyPressable>
      <MyPressable
        style={[styles.heroArrow, styles.heroArrowNext]}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Next slide"
      >
        <Text style={styles.heroArrowText}>{'›'}</Text>
      </MyPressable>

      <CarouselDots
        style={styles.heroDots}
        dotStyle={styles.heroDot}
        activeDotStyle={styles.heroDotActive}
        count={slides.length}
        activeIndex={currentSlide}
        onSelect={onSlideChange}
      />
    </View>
  )
}

export const HeroCarousel = memo(HeroCarouselInner)
