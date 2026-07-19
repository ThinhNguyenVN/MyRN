import { FontFamily } from './fonts'

export const Typography = {
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  h3: {
    fontFamily: FontFamily.medium,
    fontSize: 24,
    lineHeight: 32,
  },
  h4: {
    fontFamily: FontFamily.medium,
    fontSize: 20,
    lineHeight: 28,
  },
  h5: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    lineHeight: 26,
  },
  h6: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },

  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
  },

  body: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  label: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
  },

  caption: {
    fontFamily: FontFamily.thin,
    fontSize: 12,
    lineHeight: 16,
  },

  button: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
  },
} as const

export type TypographyKey = keyof typeof Typography

export type TypographyValue = (typeof Typography)[TypographyKey]

export type TypographyType = Record<TypographyKey, TypographyValue>
