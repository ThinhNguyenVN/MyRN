import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import MyBottomSheet from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ActionDialogProps } from './type'

/** Shared shell of every write dialog: title, body, inline error, cancel + submit (disabled while sending). */
function ActionDialog({
  visible,
  title,
  submitText,
  submitType = 'primary',
  submitDisabled = false,
  submitting,
  error,
  onClose,
  onSubmit,
  secondaryText,
  onSecondary,
  children,
}: ActionDialogProps) {
  const { t } = useTranslation()
  const styles = useThemedStyles(generateStyles)
  const buttonWidth = useIsMobileSize() ? 'full' : 'auto'

  return (
    <MyBottomSheet
      visible={visible}
      title={title}
      onClose={onClose}
      desktopPresentation="dialog"
      pressBackdropToClose={!submitting}
      enablePanDownToClose={!submitting}
      useScrollView
      footer={
        <MyView style={styles.dialogFooter}>
          <MyButton
            text={secondaryText ?? t('common.cancel')}
            type="light"
            size="small"
            width={buttonWidth}
            disabled={submitting}
            onPress={onSecondary ?? onClose}
          />
          <MyButton
            text={submitText}
            type={submitType}
            size="small"
            width={buttonWidth}
            loading={submitting}
            disabled={submitting || submitDisabled}
            onPress={onSubmit}
          />
        </MyView>
      }
    >
      <MyView style={styles.dialogBody}>
        {children}
        {error ? (
          <MyText typography="caption" color="text/alert/primary" accessibilityRole="alert">
            {error}
          </MyText>
        ) : null}
      </MyView>
    </MyBottomSheet>
  )
}

export default memo(ActionDialog)
