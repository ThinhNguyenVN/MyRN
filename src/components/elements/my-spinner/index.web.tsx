import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import type { MySpinnerProps } from './type'

const styles = StyleSheet.create({
  wrapper: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

/**
 * Web: Luôn dùng ActivityIndicator, không load Skia/WASM để tránh lỗi
 * "both async and sync fetching of the wasm failed" trên web.
 */
export default function MySpinnerWeb({ size = 'default', style, ...rest }: MySpinnerProps) {
  const indicatorSize = size === 'xsmall' ? 'small' : size === 'default' ? 'large' : 'small'
  return (
    <View style={[styles.wrapper, style]} {...rest}>
      <ActivityIndicator size={indicatorSize} />
    </View>
  )
}

export type { MySpinnerProps, SpinnerColor, SpinnerSize } from './type'
