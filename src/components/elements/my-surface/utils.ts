import { StyleSheet } from 'react-native'

import { CONTAINER_STYLE_KEYS, CONTENT_STYLE_KEYS, SurfaceStyle } from './type'

export function splitSurfaceStyle(style?: SurfaceStyle) {
  const flattened = StyleSheet.flatten(style) || {}

  const containerStyle: SurfaceStyle = {}
  const contentStyle: SurfaceStyle = {}

  Object.entries(flattened).forEach(([key, value]: [any, any]) => {
    if (CONTAINER_STYLE_KEYS.includes(key as keyof SurfaceStyle)) {
      containerStyle[key as keyof SurfaceStyle] = value
    }

    if (CONTENT_STYLE_KEYS.includes(key as keyof SurfaceStyle)) {
      contentStyle[key as keyof SurfaceStyle] = value
    }
  })

  return { containerStyle, contentStyle }
}
