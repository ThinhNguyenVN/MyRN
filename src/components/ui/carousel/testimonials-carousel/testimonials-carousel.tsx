import React, { memo, useCallback, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import { CarouselDots } from '../carousel-dots'
import { generateStyles } from './styles'
import type { TestimonialsCarouselProps } from './type'

const TestimonialsCarouselInner: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
  title,
  isMobileSize,
}) => {
  const styles = useThemedStyles(generateStyles)
  const [activeIndex, setActiveIndex] = useState(0)
  const safeIndex = Math.min(activeIndex, Math.max(testimonials.length - 1, 0))
  const testimonial = testimonials[safeIndex]

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const avatarStyle = useMemo(() => [styles.avatar], [styles.avatar])

  if (!testimonial) return null

  return (
    <View style={[styles.section, isMobileSize && styles.sectionMobile]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      <View style={styles.carouselContainer}>
        <MyPressable
          style={styles.navArrow}
          onPress={handlePrev}
          accessibilityRole="button"
          accessibilityLabel="Previous testimonial"
        >
          <Text style={styles.navArrowText}>{'‹'}</Text>
        </MyPressable>

        <View style={styles.card}>
          <MyImage url={testimonial.avatar} style={avatarStyle} />
          <Text style={styles.quoteIcon}>❝</Text>
          <Text style={styles.content}>{`"${testimonial.content}"`}</Text>
          <Text style={styles.name}>{testimonial.name}</Text>
          <Text style={styles.company}>{testimonial.company}</Text>
        </View>

        <MyPressable
          style={styles.navArrow}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel="Next testimonial"
        >
          <Text style={styles.navArrowText}>{'›'}</Text>
        </MyPressable>
      </View>

      <CarouselDots
        style={styles.dots}
        count={testimonials.length}
        activeIndex={safeIndex}
        onSelect={setActiveIndex}
      />
    </View>
  )
}

export const TestimonialsCarousel = memo(TestimonialsCarouselInner)
