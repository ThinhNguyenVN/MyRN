import { useCallback, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { HeroBackground, HeroCarousel, TestimonialsCarousel } from '@/components/ui/carousel'
import type { HeroSlide, Testimonial } from '@/components/ui/carousel'
import { FloatingContact } from '@/components/ui/floating-contact'
import type { FloatingContactItem } from '@/components/ui/floating-contact'
import { useTheme } from '@/theme/theme-context'

const DEMO_SLIDES: readonly HeroSlide[] = [
  {
    id: '1',
    title: 'Build your landing page faster',
    subtitle: 'Hero + testimonials + floating contact, all generic',
    image: { uri: 'https://picsum.photos/seed/myrn-hero-1/1200/800' },
    cta: 'Get started',
    features: [
      { kind: 'badge', icon: 'star', label: 'Themed' },
      { kind: 'badge', icon: 'zap', label: 'Fast' },
    ],
  },
  {
    id: '2',
    title: 'One kit, any brand',
    subtitle: 'Colors come from your theme tokens',
    image: { uri: 'https://picsum.photos/seed/myrn-hero-2/1200/800' },
    cta: 'Learn more',
    features: [
      { kind: 'stat', value: '5', label: 'Components' },
      { kind: 'stat', value: '0', label: 'Product coupling' },
    ],
  },
]

const DEMO_TESTIMONIALS: readonly Testimonial[] = [
  {
    id: '1',
    name: 'Alex Nguyen',
    company: 'Acme Studio',
    content: 'Dropped the hero + testimonials in and only had to wire up my own data.',
    avatar: 'https://i.pravatar.cc/100?img=11',
  },
  {
    id: '2',
    name: 'Sam Tran',
    company: 'Bright Labs',
    content: 'Colors already matched our theme tokens, no extra styling needed.',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
]

export default function HeroLandingKitScreen() {
  const { isMobileSize } = useTheme()
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % DEMO_SLIDES.length)
  }, [])

  const handleContactPress = useCallback((label: string) => {
    Alert.alert(label)
  }, [])

  const contactItems = useMemo<FloatingContactItem[]>(
    () => [
      {
        key: 'email',
        icon: 'mail',
        color: '#4BA5FA',
        accessibilityLabel: 'Send email',
        onPress: () => handleContactPress('Send email'),
      },
      {
        key: 'chat',
        icon: 'message-circle',
        color: '#0088FF',
        accessibilityLabel: 'Start chat',
        onPress: () => handleContactPress('Start chat'),
      },
      {
        key: 'call',
        icon: 'phone',
        color: '#E53935',
        accessibilityLabel: 'Call now',
        onPress: () => handleContactPress('Call now'),
        emphasized: true,
      },
    ],
    [handleContactPress],
  )

  const heroImages = useMemo(() => DEMO_SLIDES.map((slide) => slide.image), [])
  const heroHeight = isMobileSize ? 460 : 740

  return (
    <View style={demoStyles.root}>
      {/* Sibling of the ScrollView, not inside it — pinned behind everything while the
          ScrollView's content (transparent background, higher zIndex) scrolls over it.
          The hero background only disappears once an opaque section (TestimonialsCarousel)
          scrolls up far enough to cover it. Same technique the source product uses. */}
      <View style={demoStyles.stage}>
        <HeroBackground
          images={heroImages}
          currentSlide={currentSlide}
          style={[demoStyles.heroBackground, { height: heroHeight }]}
        />

        <ScrollView style={demoStyles.scrollView} contentContainerStyle={demoStyles.scrollContent}>
          <HeroCarousel
            slides={DEMO_SLIDES}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onPrev={handlePrev}
            onNext={handleNext}
            isMobileSize={isMobileSize}
          />

          <TestimonialsCarousel
            testimonials={DEMO_TESTIMONIALS}
            title={t('playground.heroLandingKitTitle')}
            isMobileSize={isMobileSize}
          />
        </ScrollView>
      </View>

      <FloatingContact items={contactItems} />
    </View>
  )
}

const demoStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stage: {
    flex: 1,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
})
