import React, { memo, useCallback } from 'react'

import MyButton from '@/components/elements/my-button'
import MyImage from '@/components/elements/my-image'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { MyAlertButtonProp, MyAlertProps, MyAlertType } from './type'
import { generateStyles, TYPE_ICON_COLOR } from './styles'

const TYPE_ICON_MAP: Record<MyAlertType, React.ComponentProps<typeof MyIcon>['name']> = {
  info: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  warning: 'warning-outline',
  error: 'alert-circle-outline',
}

const MyAlert: React.FC<MyAlertProps> = ({
  title,
  message,
  description,
  icon: iconProp,
  image,
  type = 'info',
  elevation: elevationProp,
  onClose,
  buttons,
  style,
  ...rest
}) => {
  const { defaultElevation } = useTheme()
  const elevation = elevationProp ?? defaultElevation
  const styles = useThemedStyles(generateStyles)

  const iconName = iconProp ?? TYPE_ICON_MAP[type]
  const iconColor = TYPE_ICON_COLOR[type]
  const hasHeader = !!title
  const hasVisual = !!image || !!iconName
  const hasContent = hasVisual || !!message || !!description
  const closeInContent = !!onClose && !title

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const renderFooterButton = useCallback(
    (btn: MyAlertButtonProp, index: number) => (
      <MyView key={`alert-footer-${btn.text}-${index}`} style={styles.footerButtonWrap}>
        <MyButton
          text={btn.text}
          type={btn.type ?? 'primary'}
          elevation="none"
          size="small"
          width="auto"
          containerStyle={styles.footerButtonFill}
          onPress={btn.onPress}
        />
      </MyView>
    ),
    [styles.footerButtonFill, styles.footerButtonWrap],
  )

  const closeButton = onClose ? (
    <MyPressable onPress={handleClose} animatedType="scale" scaleBySize={false} scaleValue={0.9}>
      <MyIcon name="close" size={20} color="icon/active/secondary" />
    </MyPressable>
  ) : null

  return (
    <MyView
      radius="large"
      style={[styles.container, style]}
      elevation={elevation && elevation !== 'none' ? elevation : undefined}
      {...(rest as Record<string, unknown>)}
    >
      <ConditionRenderer when={hasHeader}>
        <MyView style={styles.header}>
          <MyText typography="subtitle" style={styles.headerTitle}>
            {title}
          </MyText>
          {closeButton}
        </MyView>
      </ConditionRenderer>
      <ConditionRenderer when={hasContent || closeInContent}>
        <MyView style={styles.content}>
          <ConditionRenderer when={hasVisual}>
            <ConditionRenderer
              when={!!image}
              fallback={
                <MyView style={styles.iconWrap}>
                  <MyIcon name={iconName} size={22} color={iconColor} />
                </MyView>
              }
            >
              <MyImage source={image} contentFit="cover" style={styles.imageWrap} />
            </ConditionRenderer>
          </ConditionRenderer>
          <MyView style={styles.textWrap}>
            <ConditionRenderer when={!!message}>
              <MyText typography="body" style={styles.message}>
                {message}
              </MyText>
            </ConditionRenderer>
            <ConditionRenderer when={!!description}>
              <MyText typography="body" style={styles.message}>
                {description}
              </MyText>
            </ConditionRenderer>
          </MyView>
          <ConditionRenderer when={closeInContent}>{closeButton}</ConditionRenderer>
        </MyView>
      </ConditionRenderer>
      <ConditionRenderer when={!!buttons?.length}>
        <MyView style={styles.footer}>{buttons?.map(renderFooterButton)}</MyView>
      </ConditionRenderer>
    </MyView>
  )
}

MyAlert.displayName = 'MyAlert'

export default memo(MyAlert)
