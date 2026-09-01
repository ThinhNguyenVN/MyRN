import React, { memo, useCallback, useEffect } from 'react'
import { Keyboard, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyButton from '@/components/elements/my-button'
import MySearchInput from '@/components/elements/my-search-input'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import {
  EXPANDABLE_SEARCH_COLLAPSED_WIDTH,
  EXPANDABLE_SEARCH_HEIGHT,
  generateStyles,
} from './styles'
import type { ExpandableSearchProps } from './type'

const EXPAND_MS = 280
/**
 * Room for menu button + nav horizontal padding + close control so the
 * expanded field does not run past the screen edge.
 */
const DEFAULT_EDGE_RESERVE = 112

function ExpandableSearch({
  value,
  onChangeText,
  placeholder,
  expanded,
  onExpandedChange,
  expandedWidth: expandedWidthProp,
  searchAccessibilityLabel = 'Search',
  closeAccessibilityLabel = 'Close search',
  autoFocus = true,
}: ExpandableSearchProps) {
  const styles = useThemedStyles(generateStyles)
  const { insets } = useTheme()
  const { width: windowWidth } = useWindowDimensions()
  const expandedWidth =
    expandedWidthProp ??
    Math.max(200, windowWidth - DEFAULT_EDGE_RESERVE - (insets.right ?? 0) - (insets.left ?? 0))
  const progress = useSharedValue(expanded ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: EXPAND_MS,
      easing: Easing.out(Easing.cubic),
    })
  }, [expanded, progress])

  const rootStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [0, 1],
      [EXPANDABLE_SEARCH_COLLAPSED_WIDTH, expandedWidth],
    )
    return { width }
  }, [expandedWidth])

  const inputStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }))

  const handleOpen = useCallback(() => {
    onExpandedChange(true)
  }, [onExpandedChange])

  const handleClose = useCallback(() => {
    Keyboard.dismiss()
    onChangeText('')
    onExpandedChange(false)
  }, [onChangeText, onExpandedChange])

  const hasActiveKeyword = value.trim().length > 0

  return (
    <Animated.View style={[styles.root, rootStyle]} collapsable={false}>
      {expanded ? (
        <Animated.View style={[styles.inputWrap, inputStyle]}>
          <MySearchInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            autoFocus={autoFocus}
            height={EXPANDABLE_SEARCH_HEIGHT}
            borderless
            endIcon={null}
          />
        </Animated.View>
      ) : null}
      {expanded ? (
        <MyButton.Icon
          icon="close"
          type="secondary"
          size="small"
          elevation="none"
          onPress={handleClose}
          accessibilityLabel={closeAccessibilityLabel}
          style={styles.closeButton}
        />
      ) : (
        <MyView style={styles.searchButtonWrap}>
          {hasActiveKeyword ? <MyView style={styles.activeKeywordBadge} /> : null}
          <MyButton.Icon
            icon="search"
            type="secondary"
            size="small"
            elevation="none"
            onPress={handleOpen}
            accessibilityLabel={searchAccessibilityLabel}
          />
        </MyView>
      )}
    </Animated.View>
  )
}

export default memo(ExpandableSearch)
