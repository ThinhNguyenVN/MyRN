import { useCallback, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { FloatingContact } from '@/components/ui/floating-contact'
import type { FloatingContactItem } from '@/components/ui/floating-contact'
import { HeroBackground } from '@/components/ui/hero-background'
import { HeroCarousel } from '@/components/ui/hero-carousel'
import type { HeroSlide } from '@/components/ui/hero-carousel'
import { TestimonialsCarousel } from '@/components/ui/testimonials-carousel'
import type { Testimonial } from '@/components/ui/testimonials-carousel'
import { generateStyles } from '@/features/playground/styles'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

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
  const styles = useThemedStyles(generateStyles)
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

  return (
    <View style={demoStyles.root}>
      <ScrollView>
        <View style={styles.screenContent}>
          <MyText typography="body">{t('playground.heroLandingKitIntro')}</MyText>
        </View>

        <View style={demoStyles.heroStage}>
          <HeroBackground
            images={heroImages}
            currentSlide={currentSlide}
            style={StyleSheet.absoluteFill}
          />
          <HeroCarousel
            slides={DEMO_SLIDES}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onPrev={handlePrev}
            onNext={handleNext}
            isMobileSize={isMobileSize}
          />
        </View>

        <TestimonialsCarousel
          testimonials={DEMO_TESTIMONIALS}
          title={t('playground.heroLandingKitTitle')}
          isMobileSize={isMobileSize}
        />
      </ScrollView>

      <FloatingContact items={contactItems} />
    </View>
  )
}

const demoStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  heroStage: {
    position: 'relative',
  },
})
