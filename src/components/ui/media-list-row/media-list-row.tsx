import React, { memo } from 'react'

import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MediaListRowProps } from './type'

function MediaListRow({
  title,
  subtitle,
  imageUrl,
  placeholderIcon = 'image-outline',
  trailing,
  onPress,
  style,
  testID,
}: MediaListRowProps) {
  const styles = useThemedStyles(generateStyles)

  const content = (
    <>
      <MyView style={styles.thumb}>
        {imageUrl ? (
          <MyImage url={imageUrl} style={styles.thumbImage} contentFit="cover" />
        ) : (
          <MyIcon name={placeholderIcon} size={22} color="icon/inactive/primary" />
        )}
      </MyView>
      <MyView style={styles.body}>
        <MyText typography="subtitle" style={styles.title} numberOfLines={2}>
          {title}
        </MyText>
        {subtitle ? (
          <MyText typography="caption" style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </MyText>
        ) : null}
      </MyView>
      {trailing ? <MyView style={styles.trailing}>{trailing}</MyView> : null}
    </>
  )

  if (onPress) {
    return (
      <MyPressable style={[styles.row, style]} onPress={onPress} testID={testID}>
        {content}
      </MyPressable>
    )
  }

  return (
    <MyView style={[styles.row, style]} testID={testID}>
      {content}
    </MyView>
  )
}

export default memo(MediaListRow)
