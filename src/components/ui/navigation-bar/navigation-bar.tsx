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

  const [leftWidth, setLeftWidth] = useState(0)
  const [rightWidth, setRightWidth] = useState(0)

  const onLeftLayout = useCallback((e: LayoutChangeEvent) => {
    setLeftWidth(e.nativeEvent.layout.width)
  }, [])
  const onRightLayout = useCallback((e: LayoutChangeEvent) => {
    setRightWidth(e.nativeEvent.layout.width)
  }, [])

  const shouldShowBack = !left && showBack && onBackPress

  const padding = Math.max(leftWidth, rightWidth)
  return (
    <MyView style={styles.bar} fillParent={false}>
      <MyView style={styles.left} onLayout={onLeftLayout}>
        {left ??
          (shouldShowBack ? (
            <MyButton.Icon icon="arrow-back" type="light" size="small" onPress={onBackPress} />
          ) : null)}
      </MyView>
      <View style={styles.contentHeight}>
        <MyButton.Icon icon="arrow-back" type="light" size="small" onPress={onBackPress} />
      </View>
      <MyView style={styles.center}>
        <MyView
          style={{
            paddingRight: padding,
            paddingLeft: padding,
          }}
        >
          {!!title ? (
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
