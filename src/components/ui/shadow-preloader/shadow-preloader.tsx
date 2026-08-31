import React, { memo } from 'react'
import { View } from 'react-native'

import MySurface from '@/components/elements/my-surface'

import { styles } from './styles'
import { isAndroid } from '@/constants/dimensions'

/**
 * Pre-warm shadow/SVG pipeline khi app load.
 * Chỉ chạy trên Android (iOS/Web dùng native shadow, không cần).
 * Render MySurface off-screen để FeGaussianBlur được "compile" sẵn,
 * giảm delay khi màn hình có shadow xuất hiện lần đầu.
 */
const ShadowPreloader: React.FC = () => {
  if (!isAndroid) return null

  return (
    <View style={styles.wrapper}>
      <MySurface elevation="soft/down/small" radius="medium" fillParent style={styles.surface} />
      <MySurface elevation="soft/right/small" radius="medium" fillParent style={styles.surface} />
    </View>
  )
}

export default memo(ShadowPreloader)
