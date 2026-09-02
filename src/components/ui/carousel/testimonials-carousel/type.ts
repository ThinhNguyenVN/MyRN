export interface Testimonial {
  readonly id: string
  readonly name: string
  readonly company: string
  readonly content: string
  readonly avatar: string
}

export interface TestimonialsCarouselProps {
  readonly testimonials: readonly Testimonial[]
  readonly title?: string
  readonly isMobileSize: boolean
}
