import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import type { MyIconProps } from '@/components/elements/my-icon/type'
import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import type { ThemeType } from '@/theme/theme-context'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

const QR_SIZE = 232

export type TransferStep = {
  key: string
  icon: MyIconProps['name']
  title: string
  body: string
}

export type TransferDetailRow = {
  key: string
  label: string
  value: string
  /** What the copy button copies when it differs from `value` (e.g. a bare amount). */
  copyValue?: string
  /** Copy button on this row (needs `onCopy`). */
  copyable?: boolean
  /** Bigger value (amount, transfer content). */
  emphasis?: boolean
}

export type TransferDetailsProps = {
  /** Numbered steps above the QR (scan, keep the content, wait). */
  steps?: TransferStep[]
  qrUrl: string
  qrHint?: string
  rows: TransferDetailRow[]
  /** `null` / missing hides the copy buttons (platform without a clipboard). */
  onCopy?: ((value: string) => void) | null
  copyLabel: string
  /** Info line under the rows. */
  note?: string
}

/**
 * Bank transfer checkout: optional numbered steps, a QR code (e.g. VietQR) and the transfer
 * details with copy buttons. The caller formats every value.
 */
function TransferDetailsInner({
  steps,
  qrUrl,
  qrHint,
  rows,
  onCopy,
  copyLabel,
  note,
}: TransferDetailsProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()

  return (
    <MyView style={styles.root}>
      {steps && steps.length > 0 ? (
        <MyView style={styles.steps}>
          {steps.map((step, index) => (
            <MyView key={`transfer-step-${step.key}`} style={styles.step}>
              <MyView style={styles.stepIcon}>
                <MyIcon name={step.icon} size={20} color={getColor('brand/primary')} />
                <MyView style={styles.stepNumber}>
                  <MyText typography="label" style={{ color: getColor('text/contrast/dark') }}>
                    {index + 1}
                  </MyText>
                </MyView>
              </MyView>
              <MyView style={styles.stepText}>
                <MyText typography="subtitle">{step.title}</MyText>
                <MyText typography="caption" color="text/active/secondary">
                  {step.body}
                </MyText>
              </MyView>
            </MyView>
          ))}
        </MyView>
      ) : null}

      <MyView style={styles.transfer}>
        <MyView style={styles.qrFrame}>
          <MyImage url={qrUrl} style={styles.qr} contentFit="contain" lockAspectRatio={false} />
          {qrHint ? (
            <MyText typography="caption" color="text/active/secondary" style={styles.center}>
              {qrHint}
            </MyText>
          ) : null}
        </MyView>
        <MyView style={styles.details}>
          {rows.map((row) => (
            <DetailRow
              key={`transfer-row-${row.key}`}
              row={row}
              onCopy={row.copyable ? onCopy : null}
              copyLabel={copyLabel}
            />
          ))}
          {note ? (
            <MyView style={styles.note}>
              <MyIcon name="information-circle" size={18} color={getColor('icon/info/primary')} />
              <MyText typography="caption" color="text/active/secondary" style={styles.noteText}>
                {note}
              </MyText>
            </MyView>
          ) : null}
        </MyView>
      </MyView>
    </MyView>
  )
}

type DetailRowProps = {
  row: TransferDetailRow
  onCopy?: ((value: string) => void) | null
  copyLabel: string
}

function DetailRowInner({ row, onCopy, copyLabel }: DetailRowProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const handleCopy = useCallback(() => {
    onCopy?.(row.copyValue ?? row.value)
  }, [onCopy, row.copyValue, row.value])

  return (
    <MyView style={styles.row}>
      <MyView style={styles.rowText}>
        <MyText typography="caption" color="text/active/secondary">
          {row.label}
        </MyText>
        <MyText typography={row.emphasis ? 'h6' : 'subtitle'} selectable>
          {row.value}
        </MyText>
      </MyView>
      {onCopy ? (
        <MyPressable
          onPress={handleCopy}
          style={styles.copy}
          accessibilityRole="button"
          accessibilityLabel={`${copyLabel} ${row.label}`}
        >
          <MyIcon name="copy-outline" size={16} color={getColor('brand/primary')} />
          <MyText typography="label" color="text/active/primary">
            {copyLabel}
          </MyText>
        </MyPressable>
      ) : null}
    </MyView>
  )
}

const DetailRow = memo(DetailRowInner)

function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, isMobileSize } = theme
  return StyleSheet.create({
    root: {
      gap: getSpacing('x5'),
    },
    steps: {
      flexDirection: isMobileSize ? 'column' : 'row',
      gap: getSpacing(isMobileSize ? 'x3' : 'x4'),
    },
    step: {
      flex: isMobileSize ? undefined : 1,
      flexDirection: 'row',
      gap: getSpacing('x3'),
      alignItems: 'flex-start',
    },
    stepIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('border/info/tertiary'),
    },
    stepNumber: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('fill/active/primary'),
    },
    stepText: {
      flex: 1,
      gap: 2,
    },
    transfer: {
      flexDirection: isMobileSize ? 'column' : 'row',
      gap: getSpacing('x6'),
      alignItems: isMobileSize ? 'stretch' : 'flex-start',
    },
    qrFrame: {
      alignSelf: 'center',
      alignItems: 'center',
      gap: getSpacing('x2'),
      padding: getSpacing('x4'),
      borderRadius: 20,
      backgroundColor: getColor('brand/white'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/quaternary'),
    },
    qr: {
      width: QR_SIZE,
      height: QR_SIZE,
    },
    center: {
      textAlign: 'center',
      maxWidth: QR_SIZE,
    },
    details: {
      flex: isMobileSize ? undefined : 1,
      gap: getSpacing('x1'),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      paddingVertical: getSpacing('x3'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/quaternary'),
    },
    rowText: {
      flex: 1,
      gap: 2,
    },
    copy: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: getSpacing('x3'),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: getColor('border/active/primary'),
    },
    note: {
      flexDirection: 'row',
      gap: getSpacing('x2'),
      marginTop: getSpacing('x3'),
      padding: getSpacing('x3'),
      borderRadius: 12,
      backgroundColor: getColor('fill/background/secondary'),
    },
    noteText: {
      flex: 1,
    },
  })
}

export const TransferDetails = memo(TransferDetailsInner)
