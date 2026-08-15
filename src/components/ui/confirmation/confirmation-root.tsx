import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, View } from 'react-native'

import MyAlert from '@/components/elements/my-alert'
import type { MyAlertButtonProp } from '@/components/elements/my-alert'
import { useThemedStyles } from '@/theme/theme-context'

import type { ConfirmationOptions, ConfirmationRef } from './type'
import { generateStyles } from './styles'

type Resolver = (value: boolean) => void

const ConfirmationRoot = forwardRef<ConfirmationRef, object>(function ConfirmationRoot(_, ref) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const resolverRef = useRef<Resolver | null>(null)

  const resolveOnce = useCallback((value: boolean) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    if (resolve) {
      resolve(value)
    }
  }, [])

  const hide = useCallback(() => {
    setVisible(false)
    resolveOnce(false)
  }, [resolveOnce])

  const show = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
    if (resolverRef.current) {
      return Promise.reject(
        new Error('[Confirmation] Cannot open while another confirmation is active'),
      )
    }
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setOptions(opts)
      setVisible(true)
    })
  }, [])

  useImperativeHandle(ref, () => ({ show, hide }), [show, hide])

  const handleConfirm = useCallback(() => {
    setVisible(false)
    resolveOnce(true)
  }, [resolveOnce])

  const handleCancel = useCallback(() => {
    setVisible(false)
    resolveOnce(false)
  }, [resolveOnce])

  if (!options) {
    return null
  }

  const {
    confirmText,
    cancelText,
    buttons: customButtons,
    hideClose = true,
    type = 'info',
    ...alertProps
  } = options

  const resolvedCancelText = cancelText ?? t('common.cancel')
  const confirmType = type === 'error' ? 'tertiary' : 'primary'
  const buttons: MyAlertButtonProp[] = customButtons ?? [
    { text: resolvedCancelText, type: 'light', onPress: handleCancel },
    ...(confirmText ? [{ text: confirmText, type: confirmType, onPress: handleConfirm }] : []),
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <MyAlert
          {...alertProps}
          type={type}
          buttons={buttons}
          onClose={hideClose ? undefined : handleCancel}
          style={styles.centered}
        />
      </View>
    </Modal>
  )
})

export default ConfirmationRoot
