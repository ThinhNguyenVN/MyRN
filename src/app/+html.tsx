// Learn more https://docs.expo.dev/router/reference/static-rendering/#root-html
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html'

import seoConfig from '@root/seo.config.json'

// This file is web-only and used to configure the root HTML for every web page
// during static rendering. Only runs in Node.js during export — no DOM/browser APIs.
//
// `lang` is set here (single source, from `seo.config.json`) instead of via <Head> in
// site-seo.tsx, because spreading helmet's `htmlAttributes` on top of a static
// `lang="en"` produced a duplicate `lang` attribute in the exported HTML instead of
// replacing it. See `.docs/seo-standard.md`.
export default function Root({ children }: { children: React.ReactNode }) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext()

  return (
    <html lang={seoConfig.lang || 'en'} {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <ScrollViewStyleReset />

        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  )
}
