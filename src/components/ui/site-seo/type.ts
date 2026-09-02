export type SeoOrganizationConfig = {
  enabled: boolean
  name: string
  phone: string
  email: string
  address: string
}

export type SeoConfig = {
  enabled: boolean
  indexable: boolean
  siteUrl: string
  lang: string
  locale: string
  defaultTitle: string
  defaultDescription: string
  defaultKeywords: string[]
  themeColor: string
  ogImagePath: string
  twitterCard: string
  organization: SeoOrganizationConfig
  sitemapRoutes: string[]
}
