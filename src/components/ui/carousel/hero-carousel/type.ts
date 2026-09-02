import type { ComponentProps } from 'react'
import type { ImageSourcePropType } from 'react-native'
import { Feather } from '@expo/vector-icons'

export type HeroFeature =
  | {
      readonly kind: 'badge'
      readonly icon: ComponentProps<typeof Feather>['name']
      readonly label: string
    }
  | { readonly kind: 'stat'; readonly value: string; readonly label: string }
  | { readonly kind: 'service'; readonly title: string; readonly subtitle: string }
  | { readonly kind: 'process'; readonly step: string; readonly label: string }

export interface HeroSlide {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly image: ImageSourcePropType
  readonly cta: string
  readonly features: readonly HeroFeature[]
}

export interface HeroCarouselProps {
  readonly slides: readonly HeroSlide[]
  readonly currentSlide: number
  readonly onSlideChange: (index: number) => void
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly isMobileSize: boolean
}
