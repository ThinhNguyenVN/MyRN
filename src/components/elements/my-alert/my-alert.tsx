import React, { memo, useState, useCallback } from 'react'
import { LayoutChangeEvent } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyGradient from '@/components/elements/my-gradient'
import MyImage from '@/components/elements/my-image'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import type { MyAlertProps, MyAlertType } from './type'
import { generateStyles } from './styles'

const TYPE_ICON_MAP: Record<MyAlertType, React.ComponentProps<typeof MyIcon>['name']> = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'alert-circle',
}

const TYPE_COLOR_MAP: Record<MyAlertType, string> = {
  info: 'icon/info/primary',
  success: 'icon/success/primary',
  warning: 'icon/warning/primary',
  error: 'icon/alert/primary',
}

const MyAlert: React.FC<MyAlertProps> = ({
  title,
  message,
  description,
  icon: iconProp,
  image,
  type = 'info',
  elevation = 'soft/down/small',
  onClose,
  buttons,
  style,
  ...rest
}) => {
  const styles = useThemedStyles(generateStyles)

  const iconName = iconProp ?? TYPE_ICON_MAP[type]
  const iconColor = TYPE_COLOR_MAP[type]

  const hasHeader = !!title
  const hasVisual = !!image || !!iconName
  const hasContent = hasVisual || !!message || !!description
  const closeInContent = !!onClose && !title

  const typeCap = type.charAt(0).toUpperCase() + type.slice(1)
  const headerBorderStyle = styles[`headerBorder${typeCap}` as keyof typeof styles] as object
  const headerTitleStyle = styles[`headerTitle${typeCap}` as keyof typeof styles] as object
  const headerTitleTextStyle = styles[`headerTitleText${typeCap}` as keyof typeof styles] as object
  const gradientColors = styles.headerGradientByType?.[type]

  const Container = elevation && elevation !== 'none' ? MySurface : MyView
  const containerProps =
    elevation && elevation !== 'none'
      ? {
          radius: 'medium' as const,
          elevation,
          style: [styles.container, style],
          ...rest,
        }
      : { radius: 'medium' as const, style: [styles.container, style], ...rest }

  const [headerSize, setHeaderSize] = useState({ w: 0, h: 0 })
  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setHeaderSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }))
  }, [])

  const CloseButton = ({ iconColor }: { iconColor?: string }) => (
    <MyPressable onPress={onClose} animatedType="scale" scaleBySize={false} scaleValue={0.9}>
      <MyIcon name="close" size={20} color={(iconColor ?? 'icon/active/primary') as never} />
    </MyPressable>
  )

  return (
    <Container {...(containerProps as Record<string, unknown>)}>
      {hasHeader && (
        <MyView style={[styles.header, headerBorderStyle]} onLayout={onHeaderLayout}>
          {headerSize.w > 0 && headerSize.h > 0 && gradientColors && (
            <MyGradient
              width={headerSize.w}
              height={headerSize.h}
              startColor={gradientColors.startColor}
              endColor={gradientColors.endColor}
              startOpacity={0.5}
              endOpacity={0.6}
              style={styles.headerGradient}
            />
          )}
          <MyView style={styles.headerContent}>
            <MyView style={headerTitleStyle}>
              <MyText typography="subtitle" style={headerTitleTextStyle}>
                {title}
              </MyText>
            </MyView>
            {!!onClose && <CloseButton iconColor={iconColor} />}
          </MyView>
        </MyView>
      )}
      {(hasContent || closeInContent) && (
        <MyView style={styles.content}>
          {hasVisual && (
            <>
              {!!image ? (
                <MyImage source={image} contentFit="cover" style={styles.imageWrap} />
              ) : (
                <MyView style={styles.iconWrap}>
                  <MyIcon name={iconName} size={28} color={iconColor as never} />
                </MyView>
              )}
            </>
          )}
          <MyView style={styles.textWrap}>
            {!!message && <MyText style={styles.message}>{message}</MyText>}
            {!!description && <MyText style={styles.description}>{description}</MyText>}
          </MyView>
          {closeInContent && <CloseButton />}
        </MyView>
      )}
      {!!buttons?.length && (
        <MyView style={styles.footer}>
          {buttons.map((btn, i) => (
            <MyButton
              key={i}
              text={btn.text}
              elevation={'none'}
              type={btn.type ?? 'primary'}
              size="small"
              width="auto"
              onPress={btn.onPress}
            />
          ))}
        </MyView>
      )}
    </Container>
  )
}

MyAlert.displayName = 'MyAlert'

export default memo(MyAlert)
