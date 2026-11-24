import { memo, type ReactNode } from 'react'
import { StyleSheet } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import type { MyIconProps } from '@/components/elements/my-icon/type'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import type { ThemeType } from '@/theme/theme-context'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

export type StatusTone = 'ok' | 'warning' | 'alert'

export type StatusSummaryCardProps = {
  tone: StatusTone
  /** Small line above the title, e.g. `Gói bạn đang dùng`. */
  label?: string
  title: string
  /** Pill after the title, e.g. `Hết hạn`. */
  statusLabel?: string
  caption?: string
  /** The big figure on the right (desktop) or below (mobile), e.g. `12 ngày`. */
  bigValue?: string
  bigCaption?: string
  /** Defaults to a shield / clock / alert icon by tone. */
  icon?: MyIconProps['name']
  /** Extra content under the caption (e.g. a usage meter). */
  children?: ReactNode
  testID?: string
}

const TONE_ICON: Record<StatusTone, MyIconProps['name']> = {
  ok: 'shield-checkmark',
  warning: 'time',
  alert: 'alert-circle',
}

/**
 * Summary of something with a state (a plan, a subscription, a quota): accent edge, soft
 * status pill and a big figure, all tinted by `tone`.
 */
function StatusSummaryCardInner({
  tone,
  label,
  title,
  statusLabel,
  caption,
  bigValue,
  bigCaption,
  icon,
  children,
  testID,
}: StatusSummaryCardProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()

  const accent =
    tone === 'alert'
      ? getColor('fill/alert/primary')
      : tone === 'warning'
        ? getColor('fill/warning/primary')
        : getColor('fill/success/primary')
  // Soft tint behind the icon and the pill; the solid colour stays on the edge and the figure.
  const tint =
    tone === 'alert'
      ? getColor('border/alert/tertiary')
      : tone === 'warning'
        ? getColor('border/warning/secondary')
        : getColor('border/success/secondary')
  const tintInk =
    tone === 'alert'
      ? getColor('text/alert/primary')
      : tone === 'warning'
        ? getColor('text/active/primary')
        : getColor('text/success/primary')

  return (
    <MyView style={styles.root} testID={testID}>
      <MyView style={[styles.accent, { backgroundColor: accent }]} />
      <MyView style={styles.main}>
        <MyView style={[styles.icon, { backgroundColor: tint }]}>
          <MyIcon name={icon ?? TONE_ICON[tone]} size={22} color={accent} />
        </MyView>
        <MyView style={styles.text}>
          {label ? (
            <MyText typography="caption" color="text/active/secondary">
              {label}
            </MyText>
          ) : null}
          <MyView style={styles.nameRow}>
            <MyText typography="h4">{title}</MyText>
            {statusLabel ? (
              <MyView style={[styles.status, { backgroundColor: tint }]}>
                <MyText typography="label" style={{ color: tintInk }}>
                  {statusLabel}
                </MyText>
              </MyView>
            ) : null}
          </MyView>
          {caption ? (
            <MyText typography="caption" color="text/active/secondary">
              {caption}
            </MyText>
          ) : null}
          {children}
        </MyView>
      </MyView>
      {bigValue ? (
        <MyView style={styles.countdown}>
          <MyText style={[styles.big, { color: accent }]}>{bigValue}</MyText>
          {bigCaption ? (
            <MyText typography="caption" color="text/active/secondary">
              {bigCaption}
            </MyText>
          ) : null}
        </MyView>
      ) : null}
    </MyView>
  )
}

function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, isMobileSize } = theme
  return StyleSheet.create({
    root: {
      flexDirection: isMobileSize ? 'column' : 'row',
      alignItems: isMobileSize ? 'stretch' : 'center',
      gap: getSpacing('x4'),
      padding: getSpacing(isMobileSize ? 'x4' : 'x6'),
      paddingLeft: getSpacing(isMobileSize ? 'x5' : 'x8'),
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/quaternary'),
      boxShadow: '0 10px 30px -24px rgba(25, 28, 30, 0.45)',
    },
    accent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
    },
    main: {
      flex: isMobileSize ? undefined : 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x4'),
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      flex: 1,
      gap: 2,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
    },
    status: {
      paddingVertical: 2,
      paddingHorizontal: getSpacing('x2'),
      borderRadius: 999,
    },
    countdown: {
      alignItems: isMobileSize ? 'flex-start' : 'flex-end',
      gap: 2,
      paddingTop: isMobileSize ? getSpacing('x3') : 0,
      borderTopWidth: isMobileSize ? StyleSheet.hairlineWidth : 0,
      borderTopColor: getColor('border/inactive/quaternary'),
    },
    big: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
  })
}

export const StatusSummaryCard = memo(StatusSummaryCardInner)
