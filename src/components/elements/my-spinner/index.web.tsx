import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web'

import type { MySpinnerProps } from './type'

const styles = StyleSheet.create({
  fallback: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

/**
 * Web: Load Skia trước khi render MySpinner (vì dùng expo-router/entry, không LoadSkiaWeb ở entry).
 */
export default function MySpinnerWeb(props: MySpinnerProps) {
  return (
    <WithSkiaWeb
      getComponent={() => import('./my-spinner')}
      fallback={
        <View style={styles.fallback}>
          <ActivityIndicator size="small" />
        </View>
      }
      componentProps={props}
    />
  )
}

export type { MySpinnerProps, SpinnerColor, SpinnerSize } from './type'
