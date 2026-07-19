import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, type ImageErrorEventData, type ImageSource } from 'expo-image'
import { TouchableOpacity, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Skeleton from 'react-native-reanimated-skeleton'
import { useTranslation } from 'react-i18next'

import { isNil } from 'lodash'

import MyIcon from '../my-icon'
import MyText from '../my-text'
import MyView from '../my-view'

import { generateStyles } from './styles'
import type { MyImageProps } from './type'
import { useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, pickContainerProps } from '@/utils/styles'

const FADE_MS = 200
const CACHE_POLICY = 'memory-disk'

const MyImage: React.FC<MyImageProps> = ({
  style,
  imageStyle,
  url,
  source,
  onPress,
  onLoadStart,
  onLoad,
  onLoadEnd,
  onError,
  showMessage = false,
  emptyMessage,
  errorMessage,
  elevation = 'none',
  cachePolicy = CACHE_POLICY,
  contentFit = 'cover',
  emptyContent,
  errorContent,
  headers,
  priority,
  blurhash,
  placeholder,
  ...rest
}) => {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const defaultEmptyMessage = t('components.imageEmpty')
  const defaultErrorMessage = t('components.imageError')
  const resolvedEmptyMessage = emptyMessage ?? defaultEmptyMessage
  const resolvedErrorMessage = errorMessage ?? defaultErrorMessage

  const containerPropsStyle = useMemo(
    () =>
      getContainerStyle(
        pickContainerProps(rest as Record<string, unknown>) as Parameters<
          typeof getContainerStyle
        >[0],
      ),
    [rest],
  )
  const hasContainerPropsStyle = Object.keys(containerPropsStyle).length > 0
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
            {resolvedEmptyMessage}
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
              {resolvedErrorMessage}
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
          onLoad={onLoad}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      ) : (
        renderEmpty()
      )}
      {hasImage && isLoading && !hasPlaceholder && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <Skeleton
            isLoading
            containerStyle={styles.skeletonContainer}
            layout={[{ key: 'img', width: '100%', height: '100%' }]}
            boneColor="#E1E9EE"
            highlightColor="#F2F8FC"
            animationType="shiver"
          />
        </View>
      )}
      {hasImage && hasError && renderErrorOverlay()}
    </>
  )

  const needsDimensionFallback = useMemo(() => {
    const hasAlignSelf = !isNil(containerPropsStyle.alignSelf)
    const hasWidth = !isNil(containerPropsStyle.width)
    const hasHeight = !isNil(containerPropsStyle.height)
    return hasAlignSelf && !hasWidth && !hasHeight
  }, [containerPropsStyle])

  const containerStyle = [
    styles.container,
    ...(hasContainerPropsStyle ? [containerPropsStyle] : []),
    needsDimensionFallback && { width: '100%' as const },
    style,
  ].filter(Boolean)

  return (
    <MyView elevation={elevation} style={containerStyle}>
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
