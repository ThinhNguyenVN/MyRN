import React, { memo } from 'react'
import { View } from 'react-native'

import MyImage from '@/components/elements/my-image'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import type { Post } from './hooks'
import { generateStyles } from './styles'

export const PostRow = memo(function PostRow({ item }: { item: Post }) {
  const styles = useThemedStyles(generateStyles)
  return (
    <MyView style={styles.row} radius="small">
      <MyImage url={item.imageUrl} style={styles.thumb} />
      <View style={styles.textBlock}>
        <MyText typography="label" numberOfLines={1} style={styles.title}>
          {item.title}
        </MyText>
        <MyText
          typography="caption"
          color="text/active/tertiary"
          numberOfLines={2}
          style={styles.desc}
        >
          {item.body}
        </MyText>
      </View>
    </MyView>
  )
})
