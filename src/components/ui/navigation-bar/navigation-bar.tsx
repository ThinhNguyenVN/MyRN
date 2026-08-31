import React, { memo, useCallback, useState } from 'react'
import { LayoutChangeEvent, View } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'

import type { NavigationBarProps } from './type'
import { generateStyles } from './styles'
import { useThemedStyles } from '@/theme/theme-context'

const NavigationBar: React.FC<NavigationBarProps> = ({
  title,
  onBackPress,
  left,
  right,
  showBack = false,
}) => {
  const styles = useThemedStyles(generateStyles)

  const [barWidth, setBarWidth] = useState(0)
  const [leftWidth, setLeftWidth] = useState(0)
  const [rightWidth, setRightWidth] = useState(0)

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width)
  }, [])
  const onLeftLayout = useCallback((e: LayoutChangeEvent) => {
    setLeftWidth(e.nativeEvent.layout.width)
  }, [])
  const onRightLayout = useCallback((e: LayoutChangeEvent) => {
    setRightWidth(e.nativeEvent.layout.width)
  }, [])

  const shouldShowBack = !left && showBack && onBackPress

  const padding = Math.max(leftWidth, rightWidth)

  /**
   * The title is absolutely centered over the bar, inset by the widest side slot.
   * When a slot grows huge (e.g. expanded search) its box collapses to zero width;
   * native clips it but web keeps painting it over the input — hide instead.
   */
  const MIN_TITLE_SPACE = 80
  const hasTitleRoom = barWidth === 0 || leftWidth + rightWidth + MIN_TITLE_SPACE <= barWidth

  return (
    <MyView style={styles.bar} onLayout={onBarLayout}>
      <MyView style={styles.left} onLayout={onLeftLayout}>
        {left ??
          (shouldShowBack ? (
            <MyButton.Icon icon="arrow-back" type="secondary" size="small" onPress={onBackPress} />
          ) : null)}
      </MyView>
      <View style={styles.contentHeight}>
        <MyButton.Icon icon="arrow-back" type="secondary" size="small" onPress={onBackPress} />
      </View>
      <MyView style={styles.center}>
        <MyView
          style={{
            paddingRight: padding,
            paddingLeft: padding,
          }}
        >
          {!!title && hasTitleRoom ? (
            <MyText typography="subtitle" style={styles.title} numberOfLines={1}>
              {title}
            </MyText>
          ) : null}
        </MyView>
      </MyView>
      <MyView style={styles.right} onLayout={onRightLayout}>
        {right ?? null}
      </MyView>
    </MyView>
  )
}

export default memo(NavigationBar)
