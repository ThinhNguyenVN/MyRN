import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, type ImageErrorEventData, type ImageSource } from 'expo-image'
import { TouchableOpacity } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { isNil } from 'lodash'

import MyIcon from '../my-icon'
import MySpinner from '../my-spinner'
import MyText from '../my-text'
import MyView from '../my-view'
import MySurface from '../my-surface'

import { generateStyles } from './styles'
import type { MyImageProps } from './type'
import { useThemedStyles } from '@/theme/theme-context'

const FADE_MS = 200
const CACHE_POLICY = 'memory-disk'

const DEFAULT_EMPTY_MESSAGE = 'Không có ảnh'
const DEFAULT_ERROR_MESSAGE = 'Không thể tải ảnh'

const MyImage: React.FC<MyImageProps> = ({
  style,
  imageStyle,
  url,
  source,
  onPress,
  onLoadStart,
  onLoadEnd,
  onError,
  showMessage = false,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  elevation = 'none',
  cachePolicy = CACHE_POLICY,
  contentFit = 'cover',
  emptyContent,
  errorContent,
  headers,
  priority,
  blurhash,
  placeholder,
}) => {
  const styles = useThemedStyles(generateStyles)
  const hasImage = !isNil(source) || !!url
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(hasImage)
  const prevSourceRef = useRef(source)
  const prevUrlRef = useRef(url)
  const errorOpacity = useSharedValue(0)

  useEffect(() => {
    if (prevSourceRef.current !== source || prevUrlRef.current !== url) {
      prevSourceRef.current = source
      prevUrlRef.current = url
      setHasError(false)
      setIsLoading(hasImage)
      errorOpacity.value = 0
    }
  }, [source, url, hasImage, errorOpacity])

  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
    onLoadStart?.()
  }, [onLoadStart])

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false)
    onLoadEnd?.()
  }, [onLoadEnd])

  const handleError = useCallback(
    (event: ImageErrorEventData) => {
      setHasError(true)
      setIsLoading(false)
      errorOpacity.value = withTiming(1, { duration: FADE_MS })
      onError?.(event)
    },
    [onError, errorOpacity],
  )

  const animatedErrorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }))

  const imageSource = useMemo<ImageSource | number | null>(() => {
    if (!isNil(source)) return source
    if (!url) return null
    const s: ImageSource = { uri: url }
    if (headers && Object.keys(headers).length > 0) s.headers = headers
    return s
  }, [source, url, headers])

  const renderEmpty = () => {
    if (!isNil(emptyContent)) return emptyContent
    return (
      <MyView style={styles.emptyPlaceholder}>
        <MyIcon name="image-outline" size={32} color="icon/inactive/primary" />
        {showMessage && (
          <MyText typography="caption" color="text/inactive/primary" style={styles.message}>
            {emptyMessage}
          </MyText>
        )}
      </MyView>
    )
  }

  const renderErrorOverlay = () => (
    <Animated.View style={[styles.errorOverlay, animatedErrorStyle]} pointerEvents="none">
      {!isNil(errorContent) ? (
        errorContent
      ) : (
        <MyView style={styles.emptyPlaceholder}>
          <MyIcon name="alert-circle-outline" size={32} color="icon/alert/primary" />
          {showMessage && (
            <MyText typography="caption" color="text/alert/primary" style={styles.message}>
              {errorMessage}
            </MyText>
          )}
        </MyView>
      )}
    </Animated.View>
  )

  const imagePlaceholder = !isNil(placeholder) ? placeholder : (blurhash ?? undefined)
  const hasPlaceholder = !isNil(placeholder) || !!blurhash

  const content = (
    <>
      {hasImage ? (
        <Image
          source={imageSource!}
          style={[styles.image, imageStyle]}
          transition={FADE_MS}
          contentFit={contentFit}
          cachePolicy={cachePolicy}
          placeholder={imagePlaceholder}
          priority={priority}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      ) : (
        renderEmpty()
      )}
      {hasImage && isLoading && !hasPlaceholder && (
        <MyView style={styles.loadingOverlay} pointerEvents="none">
          <MySpinner size="small" color="primary" />
        </MyView>
      )}
      {hasImage && hasError && renderErrorOverlay()}
    </>
  )

  const containerStyle = [styles.container, style]

  if (elevation !== 'none') {
    return (
      <MySurface elevation={elevation} style={containerStyle}>
        {onPress ? (
          <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
            {content}
          </TouchableOpacity>
        ) : (
          content
        )}
      </MySurface>
    )
  }

  return (
    <MyView style={containerStyle}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </MyView>
  )
}

MyImage.displayName = 'MyImage'

export default memo(MyImage)
